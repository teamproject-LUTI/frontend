import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authUtils } from './authUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    isLoading: true,
    user: null,
    hasChecked: false
  });

  // 중복 호출 방지를 위한 ref
  const isCheckingRef = useRef(false);
  const checkTimeoutRef = useRef(null);

  // 디바운스된 인증 확인 함수
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheckAuth = useCallback(() => {
    // 이미 확인 중이면 리턴
    if (isCheckingRef.current) {
      console.log('인증 확인 이미 진행 중 - 스킵');
      return;
    }

    // 기존 타이머 클리어
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // 100ms 디바운스 적용
    checkTimeoutRef.current = setTimeout(() => {
      checkAuth();
    }, 100);
  });

  // 인증 상태 확인 함수
  const checkAuth = async () => {
    // 이미 체크했고 인증 상태가 확실하면 스킵
    if (authState.hasChecked && authState.isAuthenticated !== null) {
      console.log('인증 상태 이미 확인됨 - 스킵');
      return authState.isAuthenticated;
    }

    // 중복 실행 방지
    if (isCheckingRef.current) {
      console.log('인증 확인 이미 진행 중 - 대기');
      return;
    }

    try {
      isCheckingRef.current = true;
      console.log('인증 상태 확인 시작...');

      setAuthState(prev => ({ ...prev, isLoading: true }));

      const isAuth = await authUtils.isAuthenticated();

      if (isAuth) {
        console.log('서버 인증 성공');

        // 사용자 정보 조회 시도 (실패해도 인증은 유지)
        let userData = null;
        try {
          userData = await authUtils.getUserInfo();
          if (userData) {
            const safeUserInfo = {
              userId: userData.userId,
              name: userData.name,
              nickname: userData.nickname,
              email: userData.email,
              profileImageUrl: userData.profileImageUrl,
              socialProvider: userData.socialProvider,
              userTypeId: userData.userTypeId
            };
            sessionStorage.setItem('userInfo', JSON.stringify(safeUserInfo));
            console.log('사용자 정보 저장 완료');
          }
        } catch (userError) {
          console.warn('사용자 정보 조회 실패 (인증은 유지):', userError.message);
        }

        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: userData,
          hasChecked: true
        });

        return true;
      } else {
        console.log('서버 인증 실패');
        sessionStorage.removeItem('userInfo');
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          hasChecked: true
        });

        return false;
      }
    } catch (error) {
      console.error('인증 확인 중 오류:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasChecked: true
      });

      return false;
    } finally {
      isCheckingRef.current = false;
    }
  };

  // 로그아웃 함수
  const logout = async () => {
    try {
      await authUtils.logout();
      sessionStorage.removeItem('userInfo');
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasChecked: true
      });
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };

  // 인증 상태 리셋 (필요시)
  const resetAuth = () => {
    isCheckingRef.current = false;
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    setAuthState({
      isAuthenticated: null,
      isLoading: true,
      user: null,
      hasChecked: false
    });
  };

  // 컴포넌트 마운트 시 한 번만 인증 확인
  useEffect(() => {
    debouncedCheckAuth();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [debouncedCheckAuth]); // 빈 의존성 배열로 한 번만 실행

  // 다른 탭에서 로그인/로그아웃 감지
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'userInfo') {
        if (!e.newValue && authState.isAuthenticated) {
          // 사용자 정보가 삭제되면 로그인 페이지로
          console.log('다른 탭에서 로그아웃됨');
          setAuthState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            hasChecked: true
          });
          window.location.href = '/';
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [authState.isAuthenticated]);

  // 페이지 포커스 시 인증 상태 재확인 (선택적)
  useEffect(() => {
    const handleFocus = () => {
      // 5분 이상 지났으면 재확인
      const lastCheck = sessionStorage.getItem('lastAuthCheck');
      const now = Date.now();

      if (!lastCheck || (now - parseInt(lastCheck)) > 5 * 60 * 1000) {
        console.log('페이지 포커스 - 인증 상태 재확인');
        sessionStorage.setItem('lastAuthCheck', now.toString());
        debouncedCheckAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [debouncedCheckAuth]);

  const value = {
    ...authState,
    checkAuth: debouncedCheckAuth,
    logout,
    resetAuth
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};
