import React, { useState, useEffect, useMemo } from 'react';
import { User, Search, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../util/AuthContext';
import { authUtils } from '../../util/authUtils';
import Swal from 'sweetalert2';
import '../../styles/layout/Topbar.css';

const Topbar = () => {
  const [keyword, setKeyword] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState(null); // 이미지 타임스탬프 상태 추가
  const { user, isLoading, resetAuth } = useAuth();

  // 사용자 정보 변경 시 이미지 에러 상태 리셋 및 타임스탬프 업데이트
  useEffect(() => {
    setImageLoadError(false);
    // 프로필 이미지가 실제로 변경된 경우에만 타임스탬프 업데이트
    if (user?.profileImageUrl || user?.profileImage) {
      setImageTimestamp(Date.now());
    }
  }, [user?.profileImageUrl, user?.profileImage]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!keyword.trim()) return;

    try {
      const response = await fetch(`http://localhost:8080/luti/naver/search?keyword=${encodeURIComponent(keyword)}`);
      await response.text();
    } catch (error) {
      console.error('API 요청 중 오류:', error);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      console.log('이미 로그아웃 처리 중...');
      return;
    }

    try {
      setIsLoggingOut(true);

      const result = await Swal.fire({
        title: '로그아웃 하시겠습니까?',
        text: '현재 세션이 종료됩니다.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#F76B59',
        cancelButtonColor: '#d3d3d3',
        confirmButtonText: '로그아웃',
        cancelButtonText: '취소',
        allowOutsideClick: false,
        allowEscapeKey: false
      });

      if (!result.isConfirmed) {
        console.log('로그아웃 취소됨');
        return;
      }

      console.log('로그아웃 처리 시작...');

      Swal.fire({
        title: '로그아웃 중...',
        text: '잠시만 기다려주세요.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const logoutResult = await authUtils.logout();

      if (logoutResult.success) {
        console.log('로그아웃 성공:', logoutResult.message);

        resetAuth();

        await Swal.fire({
          title: '로그아웃 완료!',
          text: logoutResult.message || '성공적으로 로그아웃되었습니다.',
          icon: 'success',
          confirmButtonColor: '#F76B59',
          confirmButtonText: '확인',
          timer: 2000,
          timerProgressBar: true
        });

        console.log('로그인 페이지로 리다이렉트...');
        window.location.href = '/';

      } else {
        console.warn('로그아웃 처리 중 문제 발생:', logoutResult.error);

        resetAuth();

        await Swal.fire({
          title: '로그아웃 완료',
          text: logoutResult.error || '로컬 세션이 정리되었습니다.',
          icon: 'warning',
          confirmButtonColor: '#F76B59',
          confirmButtonText: '확인'
        });

        window.location.href = '/';
      }

    } catch (error) {
      console.error('로그아웃 처리 중 예외 발생:', error);

      resetAuth();

      await Swal.fire({
        title: '로그아웃 처리 완료',
        text: '일부 오류가 발생했지만 로컬 세션은 정리되었습니다.',
        icon: 'info',
        confirmButtonColor: '#F76B59',
        confirmButtonText: '확인'
      });

      window.location.href = '/';

    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleMyPageClick = () => {
    window.location.href = '/mypage';
  };

  // 사용자 이름 표시 (nickname 우선, 없으면 name)
  const getUserDisplayName = () => {
    if (!user) return '사용자님';

    return user.nickname || user.name || '사용자님';
  };

  // 프로필 이미지 URL 가져오기 - useMemo로 최적화
  const profileImageUrl = useMemo(() => {
    if (!user || imageLoadError) {
      return null;
    }

    const imageUrl = user.profileImageUrl || user.profileImage || null;

    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const fullUrl = imageUrl.startsWith('http')
          ? imageUrl
          : `${baseURL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;

      // 타임스탬프가 있을 때만 추가 (이미지 변경 시에만)
      return imageTimestamp ? `${fullUrl}?t=${imageTimestamp}` : fullUrl;
    }

    return null;
  }, [user, imageLoadError, imageTimestamp]); // imageTimestamp 의존성 추가

  // 이미지 로드 에러 처리 함수
  const handleImageError = () => {
    console.log('프로필 이미지 로드 실패:', profileImageUrl);
    setImageLoadError(true);
  };

  // 이미지 로드 성공 처리 함수 (디버깅 로그 제거)
  const handleImageLoad = () => {
    // 불필요한 성공 로그 제거
    // console.log('프로필 이미지 로드 성공:', profileImageUrl);
  };

  return (
      <header className="topbar">
        <div className="topbar-container">
          <div className="topbar-content">
            {/* Logo */}
            <div className="logo-section">
              <div className="logo-container">
                <img src="/images/topbar/luti_logo.png" alt="LUTI Logo" className="logo-image"/>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-container">
                <Search className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }}/>
                <input
                    type="text"
                    placeholder="여행지, 숙소, 액티비티 검색..."
                    className="search-input"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
              </form>
            </div>

            {/* Right Menu */}
            <div className="user-section">
              {isLoading ? (
                  <div className="user-info">
                    <div className="user-avatar">
                      <User className="user-icon"/>
                    </div>
                    <span className="user-name">로딩중...</span>
                  </div>
              ) : (
                  <div className="user-info">
                    <div className="user-avatar">
                      {profileImageUrl ? (
                          <img
                              src={profileImageUrl}
                              alt="프로필"
                              className="user-profile-image"
                              onError={handleImageError}
                              onLoad={handleImageLoad}
                          />
                      ) : null}
                      <User
                          className="user-icon"
                          style={{
                            display: profileImageUrl ? 'none' : 'block'
                          }}
                      />
                    </div>
                    <span className="user-name">{getUserDisplayName()}</span>

                    {/* 드롭다운 메뉴 */}
                    <div className="user-dropdown">
                      <button
                          className="dropdown-item"
                          onClick={handleMyPageClick}
                          disabled={isLoggingOut}
                      >
                        <Settings size={16} style={{ marginRight: '8px' }}/>
                        마이페이지
                      </button>

                      <button
                          className="dropdown-item logout-btn"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                      >
                        <LogOut size={16} style={{ marginRight: '8px' }}/>
                        {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </header>
  );
};

export default Topbar;
