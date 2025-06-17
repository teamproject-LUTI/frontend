import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../../components/layout/Layout';
import { User, Phone, Mail, MapPin, Calendar, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../../../styles/MyPage/MyPageProfile.css'
import { useAuth } from '../../../util/AuthContext';


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

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

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

  const handleSaveClick = async (section) => {
    const sectionName = section === 'basic' ? '기본 정보' : '연락처 정보';

    const result = await Swal.fire({
      title: `${sectionName}를 수정하시겠습니까?`,
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
        // 전화번호 조합
        const phoneNumber = `${editForm.phonePrefix || '010'}-${editForm.phoneMiddle || ''}-${editForm.phoneLast || ''}`;

        // 백엔드로 보낼 데이터 구성
        const updateData = {
          nickname: editForm.nickname,
          birthday: editForm.birthDate,
          gender: editForm.gender,
          phoneNumber: phoneNumber,
          address: editForm.address
        };

        // 실제 API 호출
        const updateResponse = await axios.put(`${API_BASE_URL}/api/mypage/update`, updateData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (updateResponse.status === 200 && updateResponse.data.success) {
          // 로컬 상태 업데이트
          const updatedUserInfo = {
            ...editForm,
            phone: phoneNumber
          };

          setUserInfo(updatedUserInfo);

          await updateUser({
            nickname: editForm.nickname,
            birthday: editForm.birthDate,
            gender: editForm.gender,
            phoneNumber: phoneNumber,
            address: editForm.address
          });

          await Swal.fire({
            title: '수정 완료!',
            text: `${sectionName}가 성공적으로 수정되었습니다.`,
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
      }
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  useCallback((domainType) => {
    setEditForm(prev => ({
      ...prev,
      emailDomainType: domainType,
      emailDomain: domainType === '직접입력' ? prev.customEmailDomain || '' : domainType
    }));
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  // 로딩 중일 때
  if (loading) {
    return (
        <Layout>
          <div className="mypage-container">
            <div className="mypage-content">
              <div className="loading-section">
                <div className="loading-spinner"></div>
                <p>프로필 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="mypage-container">
          <div className="mypage-content">
            {/* 에러 메시지 표시 */}
            {error && (
                <div className="error-section">
                  <p className="error-message">⚠️ {error}</p>
                  <button onClick={fetchUserProfile} className="retry-button">
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
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                      />
                  ) : null}
                  <div className="default-avatar" style={{
                    display: (editForm.profileImage || userInfo.profileImage) ? 'none' : 'flex'
                  }}>
                    <User className="avatar-icon"/>
                  </div>
                </div>
                {/* 일반 로그인 사용자만 프로필 이미지 편집 가능 */}
                {!isSocialLogin() && (
                    <div className="image-upload">
                      <input
                          type="file"
                          id="profileImage"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                      />
                      <label htmlFor="profileImage" className="upload-button">
                        <Edit2 className="upload-icon"/>
                      </label>
                    </div>
                )}
              </div>
            </div>

            {/* 정보 섹션들 */}
            <div className="info-sections">
              {/* 기본 정보 섹션 */}
              <div className="info-section">
                <div className="section-header">
                  <h2>기본 정보</h2>
                  <div className="section-actions">
                    <div className="edit-actions">
                      <button onClick={() => handleSaveClick('basic')} className="save-button">
                        저장
                      </button>
                    </div>
                  </div>
                </div>

                <div className="info-content">
                  {/* 이름 - 수정 불가 */}
                  <div className="info-row">
                    <div className="info-label">
                      <User className="info-icon"/>
                      <span>이름</span>
                    </div>
                    <div className="info-value">
                      <span>{userInfo.name}</span>
                    </div>
                  </div>

                  {/* 닉네임 - 수정 가능 */}
                  <div className="info-row">
                    <div className="info-label">
                      <User className="info-icon"/>
                      <span>닉네임</span>
                    </div>
                    <div className="info-value">
                      {isEditingBasic ? (
                          <input
                              type="text"
                              value={editForm.nickname || ''}
                              onChange={(e) => handleInputChange('nickname', e.target.value)}
                              className="edit-input"
                              placeholder="닉네임을(를) 입력하세요"
                          />
                      ) : (
                          <span>{userInfo.nickname}</span>
                      )}
                    </div>
                  </div>

                  {/* 생년월일 - 수정 가능 */}
                  <div className="info-row">
                    <div className="info-label">
                      <Calendar className="info-icon"/>
                      <span>생년월일</span>
                    </div>
                    <div className="info-value">
                      {isEditingBasic ? (
                          <input
                              type="date"
                              value={editForm.birthDate || ''}
                              onChange={(e) => handleInputChange('birthDate', e.target.value)}
                              className="edit-input"
                              placeholder="생년월일을(를) 입력하세요"
                          />
                      ) : (
                          <span>{userInfo.birthDate}</span>
                      )}
                    </div>
                  </div>

                  {/* 성별 - 수정 가능 */}
                  <div className="info-row">
                    <div className="info-label">
                      <User className="info-icon"/>
                      <span>성별</span>
                    </div>
                    <div className="info-value">
                      {isEditingBasic ? (
                          <select
                              value={editForm.gender || ''}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className="edit-input"
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
              <div className="info-section">
                <div className="section-header">
                  <h2>연락처 정보</h2>
                  <div className="section-actions">
                    <div className="edit-actions">
                      <button onClick={() => handleSaveClick('contact')} className="save-button">
                        저장
                      </button>
                    </div>
                  </div>
                </div>

                <div className="info-content">
                  {/* 휴대폰 - 수정 가능 */}
                  <div className="info-row">
                    <div className="info-label">
                      <Phone className="info-icon"/>
                      <span>휴대폰</span>
                    </div>
                    <div className="info-value">
                      {isEditingContact ? (
                          <div className="phone-input-group">
                            <select
                                value={editForm.phonePrefix || '010'}
                                onChange={(e) => handleInputChange('phonePrefix', e.target.value)}
                                className="phone-select"
                            >
                              <option value="010">010</option>
                              <option value="011">011</option>
                              <option value="016">016</option>
                              <option value="017">017</option>
                              <option value="018">018</option>
                              <option value="019">019</option>
                            </select>
                            <span className="phone-dash">-</span>
                            <input
                                type="text"
                                value={editForm.phoneMiddle || ''}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  handleInputChange('phoneMiddle', value);
                                }}
                                className="phone-input"
                                maxLength="4"
                            />
                            <span className="phone-dash">-</span>
                            <input
                                type="text"
                                value={editForm.phoneLast || ''}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  handleInputChange('phoneLast', value);
                                }}
                                className="phone-input"
                                maxLength="4"
                            />
                          </div>
                      ) : (
                          <span>{userInfo.phone}</span>
                      )}
                    </div>
                  </div>

                  <div className="info-row">
                    <div className="info-label">
                      <Mail className="info-icon"/>
                      <span>이메일</span>
                    </div>
                    <div className="info-value">
                      <div className="email-readonly-container">
                        <span className="email-readonly-text">{userInfo.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* 주소 - 수정 가능 */}
                  <div className="info-row">
                    <div className="info-label">
                      <MapPin className="info-icon"/>
                      <span>주소</span>
                    </div>
                    <div className="info-value">
                      {isEditingContact ? (
                          <input
                              type="text"
                              value={editForm.address || ''}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="edit-input"
                              placeholder="주소을(를) 입력하세요"
                          />
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
      </Layout>
  );
};

export default MyPageProfile;
