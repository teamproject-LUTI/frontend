import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authUtils } from './authUtils';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const location = useLocation();

  // 로그인이 필요 없는 경로
  const publicPaths = [
    "/", "/login", "/membership", "/auth/error", "/account/restore"
  ];

  const [authState, setAuthState] = useState({
    isAuthenticated: null,
    isLoading: true,
    user: null,
    hasChecked: false
  });

  // 중복 호출 방지를 위한 ref
  const isCheckingRef = useRef(false);
  const checkTimeoutRef = useRef(null);

  // 인증 상태 확인 함수
  const checkAuth = useCallback(async () => {
    if (publicPaths.includes(location.pathname)) {
      console.log('공개 경로 - 인증 확인 생략');
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        hasChecked: true
      }));
      return false;
    }

    /* eslint-disable */
    if (authState.hasChecked && authState.isAuthenticated !== null) {
      console.log('인증 상태 이미 확인됨 - 스킵');
      return authState.isAuthenticated;
    }

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

        let userData = null;
        try {
          const apiResponse = await authUtils.getUserInfo();

          if (apiResponse && apiResponse.success && apiResponse.user) {
            userData = apiResponse.user;
          }
        } catch (userError) {
          userData = null;
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
  }, [location.pathname]);

  // 디바운스된 인증 확인 함수
  const debouncedCheckAuth = useCallback(() => {
    if (isCheckingRef.current) {
      console.log('인증 확인 이미 진행 중 - 스킵');
      return;
    }

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkAuth();
    }, 100);
  }, [checkAuth]);

  // 사용자 정보 업데이트 함수 추가
  const updateUser = useCallback(async (updatedData) => {
    try {

      // 현재 user 정보와 업데이트된 정보를 병합
      const updatedUser = {
        ...authState.user,
        ...updatedData
      };

      setAuthState(prev => {
        const newState = {
          ...prev,
          user: updatedUser
        };
        return newState;
      });

      return true;
    } catch (error) {
      return false;
    }
  }, [authState.user]);

  // 사용자 정보 새로고침 함수 추가
  const refreshUser = useCallback(async () => {
    try {
      console.log('사용자 정보 새로고침 시작...');

      const userData = await authUtils.getUserInfo();
      if (userData) {
        setAuthState(prev => ({
          ...prev,
          user: userData
        }));
        console.log('사용자 정보 새로고침 완료');
        return true;
      }
      return false;
    } catch (error) {
      console.error('사용자 정보 새로고침 중 오류:', error);
      return false;
    }
  }, []);

  // 로그아웃 함수 (기존 방식 유지)
  const logout = async () => {
    try {
      await authUtils.logout();
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

  // 인증 상태 리셋
  const resetAuth = () => {
    console.log('AuthContext 상태 리셋 시작...');

    isCheckingRef.current = false;
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    try {
      authUtils.refreshCache();
    } catch (error) {
      console.warn('authUtils 캐시 정리 중 오류:', error);
    }

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      hasChecked: true
    });

    console.log('AuthContext 상태 리셋 완료');
  };

  // 컴포넌트 마운트 시 한 번만 인증 확인
  useEffect(() => {
    debouncedCheckAuth();

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [debouncedCheckAuth]);

  // 페이지 포커스 시 인증 상태 재확인
  useEffect(() => {
    const handleFocus = () => {
      const lastCheck = Date.now();
      if (!authState.hasChecked || (Date.now() - lastCheck) > 5 * 60 * 1000) {
        console.log('페이지 포커스 - 인증 상태 재확인');
        debouncedCheckAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [debouncedCheckAuth, authState.hasChecked]);

  const value = {
    ...authState,
    checkAuth: debouncedCheckAuth,
    logout,
    resetAuth,
    updateUser,
    refreshUser
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};
