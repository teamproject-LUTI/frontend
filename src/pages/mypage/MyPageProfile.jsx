import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { User, Phone, Mail, MapPin, Calendar, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';
import '../../styles/MyPage/MyPage.css';

const MyPageProfile = () => {
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

  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editForm, setEditForm] = useState({});

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

  const handleEditClick = (section) => {
    setEditForm({ ...userInfo });
    if (section === 'basic') {
      setIsEditingBasic(true);
    } else if (section === 'contact') {
      setIsEditingContact(true);
    }
  };

  const handleSaveClick = (section) => {
    const sectionName = section === 'basic' ? '기본 정보' : '연락처 정보';

    Swal.fire({
      title: `${sectionName}를 수정하시겠습니까?`,
      text: '변경된 정보로 업데이트됩니다.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#F76B59',
      cancelButtonColor: '#d3d3d3',
      confirmButtonText: '수정',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        setUserInfo(editForm);
        setIsEditingBasic(false);
        setIsEditingContact(false);
        Swal.fire({
          title: '수정 완료!',
          text: `${sectionName}가 성공적으로 수정되었습니다.`,
          icon: 'success',
          confirmButtonColor: '#F76B59'
        });
      }
    });
  };

  const handleCancelClick = () => {
    setIsEditingBasic(false);
    setIsEditingContact(false);
    setEditForm({});
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  const InfoRow = ({ icon: Icon, label, value, field, type = 'text', isEditing, showEdit = true }) => (
      <div className="info-row">
        <div className="info-label">
          <Icon className="info-icon" />
          <span>{label}</span>
        </div>
        <div className="info-value">
          {isEditing && showEdit ? (
              <input
                  type={type}
                  value={editForm[field] || ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  className="edit-input"
                  placeholder={`${label}을(를) 입력하세요`}
              />
          ) : (
              <span>{value}</span>
          )}
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
                  {(isEditingBasic ? editForm.profileImage : userInfo.profileImage) ? (
                      <img
                          src={isEditingBasic ? editForm.profileImage : userInfo.profileImage}
                          alt="프로필"
                      />
                  ) : (
                      <div className="default-avatar">
                        <User className="avatar-icon" />
                      </div>
                  )}
                </div>
                {isEditingBasic && (
                    <div className="image-upload">
                      <input
                          type="file"
                          id="profileImage"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                      />
                      <label htmlFor="profileImage" className="upload-button">
                        <Edit2 className="upload-icon" />
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
                    {!isEditingBasic ? (
                        <button
                            onClick={() => handleEditClick('basic')}
                            className="edit-button"
                        >
                          수정
                        </button>
                    ) : (
                        <div className="edit-actions">
                          <button
                              onClick={() => handleSaveClick('basic')}
                              className="save-button"
                          >
                            저장
                          </button>
                          <button
                              onClick={handleCancelClick}
                              className="cancel-button"
                          >
                            취소
                          </button>
                        </div>
                    )}
                  </div>
                </div>

                <div className="info-content">
                  <InfoRow
                      icon={User}
                      label="이름"
                      value={userInfo.name}
                      field="name"
                      isEditing={isEditingBasic}
                  />
                  <InfoRow
                      icon={User}
                      label="닉네임"
                      value={userInfo.nickname}
                      field="nickname"
                      isEditing={isEditingBasic}
                  />
                  <InfoRow
                      icon={Calendar}
                      label="생년월일"
                      value={userInfo.birthDate}
                      field="birthDate"
                      type="date"
                      isEditing={isEditingBasic}
                  />
                  <InfoRow
                      icon={User}
                      label="성별"
                      value={userInfo.gender}
                      field="gender"
                      isEditing={isEditingBasic}
                  />
                </div>
              </div>

              {/* 연락처 정보 섹션 */}
              <div className="info-section">
                <div className="section-header">
                  <h2>연락처 정보</h2>
                  <div className="section-actions">
                    {!isEditingContact ? (
                        <button
                            onClick={() => handleEditClick('contact')}
                            className="edit-button"
                        >
                          수정
                        </button>
                    ) : (
                        <div className="edit-actions">
                          <button
                              onClick={() => handleSaveClick('contact')}
                              className="save-button"
                          >
                            저장
                          </button>
                          <button
                              onClick={handleCancelClick}
                              className="cancel-button"
                          >
                            취소
                          </button>
                        </div>
                    )}
                  </div>
                </div>

                <div className="info-content">
                  <InfoRow
                      icon={Phone}
                      label="휴대폰"
                      value={userInfo.phone}
                      field="phone"
                      type="tel"
                      isEditing={isEditingContact}
                  />
                  <InfoRow
                      icon={Mail}
                      label="이메일"
                      value={userInfo.email}
                      field="email"
                      type="email"
                      isEditing={isEditingContact}
                  />
                  <InfoRow
                      icon={MapPin}
                      label="주소"
                      value={userInfo.address}
                      field="address"
                      isEditing={isEditingContact}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default MyPageProfile;
