import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import '../../styles/MyPage/MyPage.css';

const MyPage = () => {
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useRef(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // 전화번호 형식 변환 (010-1234-5678)
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return null;

    // 이미 형식이 맞다면 그대로 반환
    if (phoneNumber.includes('-')) return phoneNumber;

    // 숫자만 추출
    const numbers = phoneNumber.replace(/\D/g, '');

    if (numbers.length === 11) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }

    return phoneNumber; // 형식이 맞지 않으면 원본 반환
  };

  // 성별 형식 변환
  const formatGender = (gender) => {
    if (!gender) return null;

    // 이미 한글이라면 그대로 반환
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

  // useCallback으로 함수를 먼저 정의
  const fetchMyPageProfile = useCallback(async () => {
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

        // 백엔드 DTO 구조에 맞게 데이터 매핑
        const basicInfo = profileData.basicInfo || {};
        const contactInfo = profileData.contactInfo || {};

        setUserInfo({
          name: basicInfo.name || '정보 없음',
          nickname: basicInfo.nickname || '정보 없음',
          email: contactInfo.email || '정보 없음',
          phone: formatPhoneNumber(contactInfo.phoneNumber) || '정보 없음',
          birthDate: basicInfo.birthday || '정보 없음',
          gender: formatGender(basicInfo.gender) || '정보 없음',
          address: contactInfo.address || '주소를 입력하세요...',
          profileImage: basicInfo.profileImage || null
        });

        console.log('마이페이지 프로필 조회 성공:', profileData);

      } else if (response.status === 401) {
        console.log('인증 오류 - 로그인 페이지로 리다이렉트');
        window.location.href = '/';
        return;
      } else {
        throw new Error(response.data.error || '프로필 조회에 실패했습니다.');
      }

    } catch (error) {
      console.error('마이페이지 조회 중 오류:', error);

      if (error.response?.status === 401) {
        console.log('인증 만료 - 로그인 페이지로 리다이렉트');
        window.location.href = '/';
        return;
      }

      setError(error.message || '프로필 정보를 불러오는데 실패했습니다.');

      // 에러 발생 시 기본값 설정
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
  }, [API_BASE_URL]); // API_BASE_URL을 의존성에 추가

  // useEffect에서 함수 호출
  useEffect(() => {
    fetchMyPageProfile();
  }, [fetchMyPageProfile]);

  const InfoRow = ({ icon: Icon, label, value }) => (
      <div className="info-row">
        <div className="info-label">
          <Icon className="info-icon" />
          <span>{label}</span>
        </div>
        <div className="info-value">
          <span>{value}</span>
        </div>
      </div>
  );

  // 로딩 중일 때
  if (loading) {
    return (
          <div className="mypage-container">
            <div className="mypage-content">
              <div className="loading-section">
                <div className="loading-spinner"></div>
                <p>프로필 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
    );
  }

  return (
        <div className="mypage-container">
          <div className="mypage-content">
            {/* 에러 메시지 표시 */}
            {error && (
                <div className="error-section">
                  <p className="error-message">⚠️ {error}</p>
                  <button
                      onClick={fetchMyPageProfile}
                      className="retry-button"
                  >
                    다시 시도
                  </button>
                </div>
            )}

            {/* 프로필 이미지 섹션 */}
            <div className="profile-image-section">
              <div className="profile-image-container">
                <div className="profile-image">
                  {userInfo.profileImage ? (
                      <img
                          src={userInfo.profileImage}
                          alt="프로필"
                          onError={(e) => {
                            // 이미지 로드 실패 시 기본 아바타로 교체
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                      />
                  ) : null}
                  <div className="default-avatar" style={{ display: userInfo.profileImage ? 'none' : 'flex' }}>
                    <User className="avatar-icon" />
                  </div>
                </div>
              </div>
            </div>

            {/* 정보 섹션들 */}
            <div className="info-sections">
              {/* 기본 정보 섹션 */}
              <div className="info-section">
                <div className="section-header">
                  <h2>기본 정보</h2>
                </div>

                <div className="info-content">
                  <InfoRow
                      icon={User}
                      label="이름"
                      value={userInfo.name}
                  />
                  <InfoRow
                      icon={User}
                      label="닉네임"
                      value={userInfo.nickname}
                  />
                  <InfoRow
                      icon={Calendar}
                      label="생년월일"
                      value={userInfo.birthDate}
                  />
                  <InfoRow
                      icon={User}
                      label="성별"
                      value={userInfo.gender}
                  />
                </div>
              </div>

              {/* 연락처 정보 섹션 */}
              <div className="info-section">
                <div className="section-header">
                  <h2>연락처 정보</h2>
                </div>

                <div className="info-content">
                  <InfoRow
                      icon={Phone}
                      label="휴대폰"
                      value={userInfo.phone}
                  />
                  <InfoRow
                      icon={Mail}
                      label="이메일"
                      value={userInfo.email}
                  />
                  <InfoRow
                      icon={MapPin}
                      label="주소"
                      value={userInfo.address}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
  );
};

export default MyPage;
