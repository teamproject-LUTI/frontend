import React, { useEffect, useState } from 'react';
import { authUtils } from '../util/authUtils';

/**
 * 인증이 필요한 라우트를 보호하는 컴포넌트 (HttpOnly 쿠키 방식)
 */
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('인증 상태 확인 시작...');

        // 먼저 로컬 저장소에 사용자 정보가 있는지 확인 (서버 호출 없이)
        const localUserInfo = sessionStorage.getItem('userInfo');
        if (!localUserInfo) {
          console.log('로컬 사용자 정보 없음 - 서버 인증 확인 진행');
        }

        //서버에서 쿠키 기반 인증 확인 (fetch 직접 사용)
        const isAuth = await authUtils.isAuthenticated();

        if (isAuth) {
          console.log('서버 인증 성공 - 사용자 정보 조회 시작');
          setIsAuthenticated(true);

          // 인증된 경우 사용자 정보도 가져오기
          try {
            const userResponse = await fetch('/api/auth/me', {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.success) {
                // 민감하지 않은 정보만 저장
                const safeUserInfo = {
                  userId: userData.user.userId,
                  name: userData.user.name,
                  nickname: userData.user.nickname,
                  email: userData.user.email,
                  profileImageUrl: userData.user.profileImageUrl,
                  socialProvider: userData.user.socialProvider,
                  userTypeId: userData.user.userTypeId
                };
                sessionStorage.setItem('userInfo', JSON.stringify(safeUserInfo));
                console.log('사용자 정보 저장 완료');
              }
            }
          } catch (userError) {
            console.warn('사용자 정보 조회 실패:', userError);
            // 사용자 정보 조회 실패해도 인증은 성공으로 처리
          }
        } else {
          console.log('서버 인증 실패 - 로그인 필요');
          setIsAuthenticated(false);
        }

      } catch (error) {
        console.error('인증 확인 중 오류:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // 인증 상태 변화 감지 (다른 탭에서 로그인/로그아웃 시)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userInfo') {
        const hasUserInfo = !!e.newValue;
        if (!hasUserInfo) {
          // 사용자 정보가 삭제되면 로그인 페이지로 리다이렉트
          console.log('사용자 정보 삭제됨 - 로그인 페이지로 이동');
          window.location.href = '/';
        }
      }
    };

    // 다른 탭에서의 sessionStorage 변화 감지
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 로딩 중일 때 로딩 화면 표시
  if (isLoading) {
    return (
        <div className="auth-loading-container">
          <div className="auth-loading-content">
            <div className="loading-spinner"></div>
            <p>인증 확인 중...</p>
          </div>

          <style>{`
          .auth-loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #f5f5f5;
          }

          .auth-loading-content {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4285f4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }

          .auth-loading-content p {
            margin: 0;
            color: #666;
            font-size: 14px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
        </div>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    console.log('인증 실패 - 로그인 페이지로 이동');
    // 현재 경로가 이미 루트 경로가 아닌 경우에만 리다이렉트
    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
    return null;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  console.log('인증 성공 - 컴포넌트 렌더링');
  return children;
};

export default ProtectedRoute;
