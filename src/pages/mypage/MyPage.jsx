import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import '../../styles/MyPage/MyPage.css';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState({
    name: '홍길동',
    nickname: '홍홍',
    email: 'safs02@naver.com',
    phone: '010-1111-****',
    birthDate: '1990.05.02',
    gender: '남성',
    address: '주소를 입력하세요...',
    profileImage: null
  });

  useEffect(() => {
    // 실제로는 API에서 사용자 정보를 가져옴
    const storedUserInfo = sessionStorage.getItem('userInfo');
    if (storedUserInfo) {
      const userData = JSON.parse(storedUserInfo);
      setUserInfo(prev => ({
        ...prev,
        name: userData.name || prev.name,
        nickname: userData.nickname || prev.nickname,
        email: userData.email || prev.email
      }));
    }
  }, []);

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

  return (
      <Layout>
        <div className="mypage-container">
          <div className="mypage-content">
            {/* 프로필 이미지 섹션 */}
            <div className="profile-image-section">
              <div className="profile-image-container">
                <div className="profile-image">
                  {userInfo.profileImage ? (
                      <img
                          src={userInfo.profileImage}
                          alt="프로필"
                      />
                  ) : (
                      <div className="default-avatar">
                        <User className="avatar-icon" />
                      </div>
                  )}
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
      </Layout>
  );
};

export default MyPage;
