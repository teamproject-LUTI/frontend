/* eslint-disable no-console, no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../../../styles/MyPage/MyPageProfile.css'
import { useAuth } from '../../../util/AuthContext';
import { authUtils } from '../../../util/authUtils';


const EMAIL_DOMAINS = [
  'gmail.com',
  'naver.com',
  'daum.net',
  'kakao.com',
  'hanmail.net',
  'hotmail.com',
  'yahoo.com',
  'outlook.com',
  '직접입력'
];

const MyPageProfile = () => {
  const { updateUser, user } = useAuth();

  const [userInfo, setUserInfo] = useState({
    name: '로딩중...',
    nickname: '로딩중...',
    email: '로딩중...',
    phone: '로딩중...',
    birthDate: '로딩중...',
    gender: '로딩중...',
    address: '로딩중...',
    profileImage: null
  });

  const [isEditingBasic] = useState(true);
  const [isEditingContact] = useState(true);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // 주소 관련 상태 추가
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // Daum 우편번호 API 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거
      const existingScript = document.querySelector('script[src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  // 우편번호 검색 핸들러
  const handlePostcodeSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        let addr = ''; // 주소
        let extraAddr = ''; // 참고항목

        //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
          addr = data.roadAddress;
        } else { // 사용자가 지번 주소를 선택했을 경우(J)
          addr = data.jibunAddress;
        }

        // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
        if (data.userSelectedType === 'R') {
          // 법정동명이 있을 경우 추가한다. (법정리는 제외)
          // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname;
          }
          // 건물명이 있고, 공동주택일 경우 추가한다.
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }
          // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if (extraAddr !== '') {
            extraAddr = ' (' + extraAddr + ')';
          }
        }

        setPostalCode(data.zonecode);
        setAddress(addr);
        setExtraAddress(extraAddr);

        // 자동으로 상세주소 입력란에 포커스
        setTimeout(() => {
          document.getElementById("detailAddressInput")?.focus();
        }, 100);
      }
    }).open();
  };

  // 소셜 로그인 여부 체크 함수
  const isSocialLogin = () => {
    if (!user || loading) return true;

    return user.provider !== 'LOCAL';
  };

  // 전화번호 형식 변환
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    if (phoneNumber.includes('-')) return phoneNumber;

    const numbers = phoneNumber.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    return phoneNumber;
  };

  // 날짜 형식 변환
  const formatDateForInput = (dateString) => {
    if (!dateString || dateString === '정보 없음') return '';

    // 2025.06.05 → 2025-06-05 변환
    return dateString.replace(/\./g, '-');
  };

  // 성별 형식 변환
  const formatGender = (gender) => {
    if (!gender) return null;
    if (gender === '남성' || gender === '여성') return gender;

    switch (gender.toLowerCase()) {
      case 'male':
      case 'm':
        return '남성';
      case 'female':
      case 'f':
        return '여성';
      default:
        return gender;
    }
  };

  // 주소 분해 함수 (개선된 버전 - 한국 주소 체계 기반)
  const parseAddress = (fullAddress) => {
    if (!fullAddress || fullAddress === '주소를 입력하세요...' || fullAddress === '정보 없음') {
      return {
        postalCode: '',
        address: '',
        detailAddress: '',
        extraAddress: ''
      };
    }

    let result = {
      postalCode: '',
      address: '',
      detailAddress: '',
      extraAddress: ''
    };

    let workingAddress = fullAddress;

    // 1. 우편번호 추출 (5자리 숫자)
    const postalCodeRegex = /\b(\d{5})\b/;
    const postalMatch = workingAddress.match(postalCodeRegex);
    if (postalMatch) {
      result.postalCode = postalMatch[1];
      workingAddress = workingAddress.replace(postalCodeRegex, '').trim();
    }

    // 2. 참고항목 추출 (괄호 안의 내용)
    const extraRegex = /\(([^)]+)\)/g;
    const extraMatches = [];
    let extraMatch;
    while ((extraMatch = extraRegex.exec(workingAddress)) !== null) {
      extraMatches.push(extraMatch[1]);
    }
    if (extraMatches.length > 0) {
      result.extraAddress = `(${extraMatches.join(', ')})`;
      workingAddress = workingAddress.replace(/\([^)]+\)/g, '').trim();
    }

    // 3. 주소 구분 패턴들
    const patterns = [
      // 도로명주소 패턴
      {
        regex: /^(.*?[시도])\s+(.*?[시군구])\s+(.*?[로길])\s+(\d+(?:-\d+)?)\s*(.*)$/,
        type: 'road'
      },
      // 지번주소 패턴
      {
        regex: /^(.*?[시도])\s+(.*?[시군구])\s+(.*?[동면읍리])\s+(\d+(?:-\d+)?)\s*(.*)$/,
        type: 'jibun'
      },
      // 간단한 패턴 (동까지만)
      {
        regex: /^(.*?[시도])\s+(.*?[시군구])\s+(.*?[동면읍])\s*(.*)$/,
        type: 'simple'
      }
    ];

    let matched = false;
    for (const pattern of patterns) {
      const match = workingAddress.match(pattern.regex);
      if (match) {
        if (pattern.type === 'road' || pattern.type === 'jibun') {
          // 시도 + 시군구 + 도로명/동 + 번지까지 기본주소
          result.address = `${match[1]} ${match[2]} ${match[3]} ${match[4]}`.trim();
          result.detailAddress = match[5] ? match[5].trim() : '';
        } else {
          // 간단한 패턴의 경우
          result.address = `${match[1]} ${match[2]} ${match[3]}`.trim();
          result.detailAddress = match[4] ? match[4].trim() : '';
        }
        matched = true;
        break;
      }
    }

    // 4. 패턴 매칭 실패 시 fallback 로직
    if (!matched) {
      const words = workingAddress.split(/\s+/);

      // 단어가 많은 경우 앞쪽을 기본주소로
      if (words.length > 3) {
        const splitPoint = Math.ceil(words.length * 0.6); // 60% 지점에서 분할
        result.address = words.slice(0, splitPoint).join(' ');
        result.detailAddress = words.slice(splitPoint).join(' ');
      } else {
        // 단어가 적은 경우 모두 상세주소로
        result.detailAddress = workingAddress;
      }
    }

    return result;
  };

  // API에서 프로필 데이터 가져오기
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/api/mypage`, {
        withCredentials: true,
        validateStatus: function (status) {
          return (status >= 200 && status < 300) || status === 401;
        }
      });

      if (response.status === 200 && response.data.success) {
        const profileData = response.data.profile;
        const basicInfo = profileData.basicInfo || {};
        const contactInfo = profileData.contactInfo || {};

        const userData = {
          name: basicInfo.name || '정보 없음',
          nickname: basicInfo.nickname || '정보 없음',
          email: contactInfo.email || '정보 없음',
          phone: formatPhoneNumber(contactInfo.phoneNumber) || '정보 없음',
          birthDate: formatDateForInput(basicInfo.birthday) || '정보 없음',
          gender: formatGender(basicInfo.gender) || '정보 없음',
          address: contactInfo.address || '주소를 입력하세요...',
          profileImage: basicInfo.profileImage || null
        };

        setUserInfo(userData);

        // 주소 파싱하여 상태 설정
        const parsedAddress = parseAddress(userData.address);
        setPostalCode(parsedAddress.postalCode);
        setAddress(parsedAddress.address);
        setDetailAddress(parsedAddress.detailAddress);
        setExtraAddress(parsedAddress.extraAddress);

      } else if (response.status === 401) {
        console.log('인증 오류 - 로그인 페이지로 리다이렉트');
        window.location.href = '/';
        return;
      } else {
        throw new Error(response.data.error || '프로필 조회에 실패했습니다.');
      }

    } catch (error) {
      console.error('프로필 조회 중 오류:', error);

      if (error.response?.status === 401) {
        console.log('인증 만료 - 로그인 페이지로 리다이렉트');
        window.location.href = '/';
        return;
      }

      setError(error.message || '프로필 정보를 불러오는데 실패했습니다.');

      setUserInfo({
        name: '정보 없음',
        nickname: '정보 없음',
        email: '정보 없음',
        phone: '정보 없음',
        birthDate: '정보 없음',
        gender: '정보 없음',
        address: '주소를 입력하세요...',
        profileImage: null
      });

    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!loading && userInfo.name !== '로딩중...') {
      const phoneMatch = userInfo.phone?.match(/(\d{3})-(\d{3,4})-(\d{4})/);
      const emailMatch = userInfo.email?.match(/^([^@]+)@(.+)$/);

      setEditForm({
        ...userInfo,
        phonePrefix: phoneMatch ? phoneMatch[1] : '010',
        phoneMiddle: phoneMatch ? phoneMatch[2] : '',
        phoneLast: phoneMatch ? phoneMatch[3] : '',
        emailLocal: emailMatch ? emailMatch[1] : '',
        emailDomain: emailMatch ? emailMatch[2] : 'gmail.com',
        emailDomainType: emailMatch && EMAIL_DOMAINS.includes(emailMatch[2]) ? emailMatch[2] : '직접입력',
        customEmailDomain: emailMatch && !EMAIL_DOMAINS.includes(emailMatch[2]) ? emailMatch[2] : ''
      });
    }
  }, [userInfo, loading]);

  const handleInputChange = useCallback((field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 파일 유효성 검사
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          title: '파일 형식 오류',
          text: 'JPG, JPEG, PNG, GIF, WEBP 파일만 업로드 가능합니다.',
          icon: 'error',
          confirmButtonColor: '#F76B59'
        });
        return;
      }

      // 파일 크기 검사 (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        Swal.fire({
          title: '파일 크기 초과',
          text: '파일 크기는 5MB를 초과할 수 없습니다.',
          icon: 'error',
          confirmButtonColor: '#F76B59'
        });
        return;
      }

      // 선택된 파일 저장
      setSelectedImageFile(file);

      // 미리보기 표시
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditForm(prev => ({
          ...prev,
          profileImage: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 이미지 업로드 API 함수
  const uploadProfileImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/mypage/profile-image`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 && response.data.profileImageUrl) {
        console.log('프로필 이미지 업로드 성공:', response.data);
        return response.data.profileImageUrl;
      } else {
        throw new Error(response.data.message || '프로필 이미지 업로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 이미지 업로드 오류:', error);
      throw error;
    }
  };

  // 유효성 검사 함수
  const validateForm = () => {
    const errors = [];

    // 닉네임 검사
    if (!editForm.nickname || editForm.nickname.trim() === '') {
      errors.push('닉네임을 입력해주세요.');
    } else if (editForm.nickname.trim().length < 2) {
      errors.push('닉네임은 2자 이상 입력해주세요.');
    } else if (editForm.nickname.trim().length > 20) {
      errors.push('닉네임은 20자 이하로 입력해주세요.');
    }

    // 생년월일 검사 (일반 로그인 사용자는 수정 불가이므로 소셜 로그인 사용자만 검사)
    if (isSocialLogin()) {
      if (!editForm.birthDate || editForm.birthDate === '') {
        errors.push('생년월일을 입력해주세요.');
      } else {
        const birthDate = new Date(editForm.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (birthDate > today) {
          errors.push('생년월일은 오늘 날짜보다 이전이어야 합니다.');
        } else if (age > 120) {
          errors.push('올바른 생년월일을 입력해주세요.');
        }
      }
    }

    // 성별 검사
    if (!editForm.gender || editForm.gender === '') {
      errors.push('성별을 선택해주세요.');
    }

    // 휴대폰 번호 검사
    const phoneMiddle = editForm.phoneMiddle || '';
    const phoneLast = editForm.phoneLast || '';

    if (!phoneMiddle || phoneMiddle.length < 3) {
      errors.push('휴대폰 번호 가운데 자리를 올바르게 입력해주세요.');
    }

    if (!phoneLast || phoneLast.length < 4) {
      errors.push('휴대폰 번호 마지막 자리를 올바르게 입력해주세요.');
    }

    // 주소 검사 - 우편번호와 기본주소가 있거나, 상세주소라도 있어야 함
    if ((!postalCode || !address) && !detailAddress.trim()) {
      errors.push('주소를 입력해주세요.');
    }

    return errors;
  };

  // 저장 함수 - 통합된 저장 버튼용
  const handleSaveClick = async () => {
    // 유효성 검사
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      await Swal.fire({
        title: '입력 오류',
        html: validationErrors.map(error => `• ${error}`).join('<br>'),
        icon: 'warning',
        confirmButtonColor: '#F76B59'
      });
      return;
    }

    const result = await Swal.fire({
      title: '프로필을 수정하시겠습니까?',
      text: '변경된 정보로 업데이트됩니다.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#F76B59',
      cancelButtonColor: '#d3d3d3',
      confirmButtonText: '수정',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        setImageUploadLoading(true);

        // 1. 프로필 이미지 업로드 처리 (선택된 파일이 있고, 일반 로그인 사용자인 경우)
        let updatedImageUrl = userInfo.profileImage;
        if (selectedImageFile && !isSocialLogin()) {
          try {
            console.log('프로필 이미지 업로드 시작...');
            updatedImageUrl = await uploadProfileImage(selectedImageFile);
            console.log('프로필 이미지 업로드 완료:', updatedImageUrl);
          } catch (imageError) {
            console.error('프로필 이미지 업로드 실패:', imageError);

            await Swal.fire({
              title: '이미지 업로드 실패',
              text: imageError.response?.data?.message || '프로필 이미지 업로드에 실패했습니다.',
              icon: 'error',
              confirmButtonColor: '#F76B59'
            });
            return; // 이미지 업로드 실패 시 전체 수정 중단
          }
        }

        // 2. 텍스트 정보 업데이트
        //phoneNumber 변수 정의
        const phoneNumber = `${editForm.phonePrefix || '010'}${editForm.phoneMiddle || ''}${editForm.phoneLast || ''}`;

        // 주소 합치기
        let fullAddress = '';
        if (postalCode && address) {
          // 새로 검색한 주소가 있는 경우
          fullAddress = `${address} ${detailAddress} ${extraAddress}`.trim();
        } else if (detailAddress.trim()) {
          // 기존 주소를 수정한 경우
          fullAddress = detailAddress.trim();
        }

        const updateData = {
          nickname: editForm.nickname.trim(),
          birthday: isSocialLogin() ? editForm.birthDate : undefined, // 소셜 로그인만 생년월일 수정
          gender: editForm.gender,
          phoneNumber: phoneNumber,
          address: fullAddress
        };

        const updateResponse = await axios.put(`${API_BASE_URL}/api/mypage/update`, updateData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (updateResponse.status === 200 && updateResponse.data.success) {
          // 3. 로컬 상태 업데이트
          const updatedUserInfo = {
            ...editForm,
            phone: phoneNumber,
            address: fullAddress,
            profileImage: updatedImageUrl
          };

          setUserInfo(updatedUserInfo);

          // 4. AuthContext 업데이트
          const authUpdateData = {
            nickname: editForm.nickname.trim(),
            birthday: isSocialLogin() ? editForm.birthDate : undefined,
            gender: editForm.gender,
            phoneNumber: phoneNumber,
            address: fullAddress,
            profileImageUrl: updatedImageUrl
          };

          // 5. 🔥 강제로 최신 사용자 정보 다시 가져오기
          setTimeout(async () => {
            try {
              console.log('최신 사용자 정보 재조회 시작...');
              const freshData = await authUtils.getUserInfo();
              if (freshData && freshData.success) {
                console.log('최신 사용자 정보 조회 성공:', freshData.user);
                await updateUser(freshData.user);
              }
            } catch (error) {
              console.error('최신 사용자 정보 조회 실패:', error);
            }
          }, 500);

          // 6. 선택된 파일 초기화
          setSelectedImageFile(null);

          await Swal.fire({
            title: '수정 완료!',
            text: '프로필이 성공적으로 수정되었습니다.',
            icon: 'success',
            confirmButtonColor: '#F76B59'
          });

        } else {
          throw new Error(updateResponse.data.error || '프로필 수정에 실패했습니다.');
        }

      } catch (error) {
        console.error('프로필 업데이트 오류:', error);

        let errorMessage = '프로필 수정 중 오류가 발생했습니다.';

        if (error.response?.status === 401) {
          errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }

        await Swal.fire({
          title: '수정 실패',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#F76B59'
        });
      } finally {
        setImageUploadLoading(false);
      }
    }
  };

  // 프로필 이미지 삭제 함수
  const handleDeleteProfileImage = async () => {
    if (isSocialLogin()) {
      Swal.fire({
        title: '권한 없음',
        text: '소셜 로그인 사용자는 프로필 이미지를 삭제할 수 없습니다.',
        icon: 'warning',
        confirmButtonColor: '#F76B59'
      });
      return;
    }

    const result = await Swal.fire({
      title: '프로필 이미지 삭제',
      text: '프로필 이미지를 삭제하시겠습니까?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d3d3d3',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        setImageUploadLoading(true);

        const response = await axios.delete(`${API_BASE_URL}/api/mypage/profile-image`, {
          withCredentials: true
        });

        if (response.status === 200) {
          // 로컬 상태 업데이트
          setUserInfo(prev => ({ ...prev, profileImage: null }));
          setEditForm(prev => ({ ...prev, profileImage: null }));
          setSelectedImageFile(null);

          // AuthContext 업데이트
          await updateUser({
            profileImage: null,
            profileImageUrl: null
          });

          await Swal.fire({
            title: '삭제 완료!',
            text: '프로필 이미지가 삭제되었습니다.',
            icon: 'success',
            confirmButtonColor: '#F76B59'
          });
        }
      } catch (error) {
        console.error('프로필 이미지 삭제 오류:', error);

        await Swal.fire({
          title: '삭제 실패',
          text: error.response?.data?.message || '프로필 이미지 삭제에 실패했습니다.',
          icon: 'error',
          confirmButtonColor: '#F76B59'
        });
      } finally {
        setImageUploadLoading(false);
      }
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
        <div className="profile-mypage-container">
          <div className="profile-mypage-content">
            <div className="profile-loading-section">
              <div className="profile-loading-spinner"></div>
              <p>프로필 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="profile-mypage-container">
        <div className="profile-mypage-content">
          {/* 에러 메시지 표시 */}
          {error && (
              <div className="profile-error-section">
                <p className="profile-error-message">⚠️ {error}</p>
                <button onClick={fetchUserProfile} className="profile-retry-button">
                  다시 시도
                </button>
              </div>
          )}

          {/* 프로필 이미지 섹션 */}
          <div className="profile-image-section">
            <div className="profile-image-container">
              <div className="profile-image">
                {(editForm.profileImage || userInfo.profileImage) ? (
                    <img
                        src={editForm.profileImage || userInfo.profileImage}
                        alt="프로필"
                        onError={(e) => {
                          console.log('프로필 이미지 로드 실패:', editForm.profileImage || userInfo.profileImage);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div className="profile-default-avatar" style={{
                  display: (editForm.profileImage || userInfo.profileImage) ? 'none' : 'flex'
                }}>
                  <User className="profile-avatar-icon"/>
                </div>
              </div>

              {/* 일반 로그인 사용자만 프로필 이미지 편집 가능 */}
              {!isSocialLogin() && (
                  <div className="profile-image-controls-horizontal">
                    {/* 이미지 업로드 버튼 (왼쪽) */}
                    <div className="profile-image-upload-horizontal">
                      <input
                          type="file"
                          id="profileImage"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                          disabled={imageUploadLoading}
                      />
                      <label htmlFor="profileImage" className="profile-upload-button-horizontal" title="이미지 업로드">
                        {imageUploadLoading ? (
                            <div className="profile-loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                        ) : (
                            <Edit2 className="profile-upload-icon"/>
                        )}
                      </label>
                    </div>

                    {/* 이미지 삭제 버튼 (오른쪽) - 프로필 이미지가 있을 때만 */}
                    {(userInfo.profileImage || editForm.profileImage) && !selectedImageFile && (
                        <div className="profile-image-delete-horizontal">
                          <button
                              onClick={handleDeleteProfileImage}
                              className="profile-delete-button-horizontal"
                              disabled={imageUploadLoading}
                              title="이미지 삭제"
                          >
                            ×
                          </button>
                        </div>
                    )}
                  </div>
              )}
            </div>
          </div>

          {/* 정보 섹션들 */}
          <div className="profile-info-sections">
            {/* 기본 정보 섹션 */}
            <div className="profile-info-section">
              <div className="profile-section-header">
                <h2>기본 정보</h2>
                <div className="profile-section-actions">
                  <div className="profile-edit-actions">
                    <button
                        onClick={handleSaveClick}
                        className="profile-save-button"
                        disabled={imageUploadLoading}
                    >
                      {imageUploadLoading ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="profile-info-content">
                {/* 이름 - 수정 불가 */}
                <div className="profile-info-row">
                  <div className="profile-info-label">
                    <User className="profile-info-icon"/>
                    <span>이름</span>
                  </div>
                  <div className="profile-info-value">
                    <span>{userInfo.name}</span>
                  </div>
                </div>

                {/* 닉네임 - 수정 가능 */}
                <div className="profile-info-row">
                  <div className="profile-info-label">
                    <User className="profile-info-icon"/>
                    <span>닉네임</span>
                  </div>
                  <div className="profile-info-value">
                    {isEditingBasic ? (
                        <input
                            type="text"
                            value={editForm.nickname || ''}
                            onChange={(e) => handleInputChange('nickname', e.target.value)}
                            className="profile-edit-input"
                            placeholder="닉네임을(를) 입력하세요"
                        />
                    ) : (
                        <span>{userInfo.nickname}</span>
                    )}
                  </div>
                </div>

                {/* 생년월일 - 소셜 로그인만 수정 가능 */}
                <div className="profile-info-row">
                  <div className="profile-info-label">
                    <Calendar className="profile-info-icon"/>
                    <span>생년월일</span>
                  </div>
                  <div className="profile-info-value">
                    {isEditingBasic && isSocialLogin() ? (
                        <input
                            type="date"
                            value={editForm.birthDate || ''}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            className="profile-edit-input"
                            placeholder="생년월일을(를) 입력하세요"
                        />
                    ) : (
                        <span>{userInfo.birthDate}</span>
                    )}
                  </div>
                </div>

                {/* 성별 - 수정 가능 */}
                <div className="profile-info-row">
                  <div className="profile-info-label">
                    <User className="profile-info-icon"/>
                    <span>성별</span>
                  </div>
                  <div className="profile-info-value">
                    {isEditingBasic ? (
                        <select
                            value={editForm.gender || ''}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className="profile-edit-input"
                        >
                          <option value="">성별 선택</option>
                          <option value="남성">남성</option>
                          <option value="여성">여성</option>
                        </select>
                    ) : (
                        <span>{userInfo.gender}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 연락처 정보 섹션 */}
            <div className="profile-info-section">
              <div className="profile-section-header">
                <h2>연락처 정보</h2>
              </div>

              <div className="profile-info-content">
                {/* 휴대폰 - 수정 가능 */}
                <div className="profile-info-row">
                  <div className="profile-info-label">
                    <Phone className="profile-info-icon"/>
                    <span>휴대폰</span>
                  </div>
                  <div className="profile-info-value">
                    {isEditingContact ? (
                        <div className="profile-phone-input-group">
                          <select
                              value={editForm.phonePrefix || '010'}
                              onChange={(e) => handleInputChange('phonePrefix', e.target.value)}
                              className="profile-phone-select"
                          >
                            <option value="010">010</option>
                            <option value="011">011</option>
                            <option value="016">016</option>
                            <option value="017">017</option>
                            <option value="018">018</option>
                            <option value="019">019</option>
                          </select>
                          <span className="profile-phone-dash">-</span>
                          <input
                              type="text"
                              value={editForm.phoneMiddle || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                handleInputChange('phoneMiddle', value);
                              }}
                              className="profile-phone-input"
                              maxLength="4"
                          />
                          <span className="profile-phone-dash">-</span>
                          <input
                              type="text"
                              value={editForm.phoneLast || ''}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                handleInputChange('phoneLast', value);
                              }}
                              className="profile-phone-input"
                              maxLength="4"
                          />
                        </div>
                    ) : (
                        <span>{userInfo.phone}</span>
                    )}
                  </div>
                </div>

                {/* 이메일 - 읽기 전용 */}
                <div className="profile-info-row">
                  <div className="profile-info-label">
                    <Mail className="profile-info-icon"/>
                    <span>이메일</span>
                  </div>
                  <div className="profile-info-value">
                    <div className="profile-email-readonly-container">
                      <span className="profile-email-readonly-text">{userInfo.email}</span>
                    </div>
                  </div>
                </div>

                {/* 주소 - Daum API 사용하여 수정 가능 */}
                <div className="profile-info-row">
                  <div className="profile-info-label">
                    <MapPin className="profile-info-icon"/>
                    <span>주소</span>
                  </div>
                  <div className="profile-info-value">
                    {isEditingContact ? (
                        <div className="profile-address-input-group">
                          {/* 우편번호 + 검색 버튼 */}
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={postalCode}
                                readOnly
                                placeholder="우편번호"
                                className="profile-edit-input"
                                style={{ width: "120px" }}
                            />
                            <button
                                type="button"
                                onClick={handlePostcodeSearch}
                                className="profile-postcode-button"
                            >
                              우편번호 찾기
                            </button>
                          </div>

                          {/* 기본 주소 */}
                          <input
                              type="text"
                              value={address}
                              readOnly
                              placeholder="주소"
                              className="profile-edit-input"
                              style={{ marginBottom: "8px" }}
                          />

                          {/* 상세주소 + 참고항목 */}
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                id="detailAddressInput"
                                value={detailAddress}
                                onChange={(e) => setDetailAddress(e.target.value)}
                                placeholder="상세주소"
                                className="profile-edit-input"
                            />
                            <input
                                type="text"
                                value={extraAddress}
                                readOnly
                                placeholder="참고항목"
                                className="profile-edit-input"
                            />
                          </div>
                        </div>
                    ) : (
                        <span>{userInfo.address}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MyPageProfile;
