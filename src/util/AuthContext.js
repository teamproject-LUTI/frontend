import React, { createContext, useContext, useState, useEffect, useRef, useCallback} from 'react';
import apiClient from './apiClient';
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

  const publicPaths = [
    "/", "/login", "/membership", "/auth/error",
    "/login/oauth2/code/kakao", "/login/oauth2/code/google",
    "/account/find"
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

  const checkAuth = useCallback(async () => {
    const isRestorePage = location.pathname === '/account/restore';

    if (publicPaths.includes(location.pathname)) {
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        isLoading: false,
        hasChecked: true
      }));
      return false;
    }

    if (authState.hasChecked && authState.isAuthenticated !== null && !isRestorePage) {
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

      // apiClient 사용으로 변경
      const response = await apiClient.get('/api/auth/me');

      if (response.status === 200 && response.data.success) {
        console.log('서버 인증 성공');
        const userData = response.data.user;

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

      // 복구 페이지에서는 인증 실패를 허용
      if (isRestorePage) {
        console.log('복구 페이지 - 인증 실패 허용');
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          hasChecked: true
        });
        return false;
      }

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
  }, [location.pathname, authState.hasChecked, authState.isAuthenticated]);

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

  // 사용자 정보 업데이트 함수
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

  // 사용자 정보 새로고침 함수 - apiClient 사용으로 수정
  const refreshUser = useCallback(async () => {
    try {
      console.log('사용자 정보 새로고침 시작...');

      const response = await apiClient.get('/api/auth/me');
      if (response.status === 200 && response.data.success && response.data.user) {
        setAuthState(prev => ({
          ...prev,
          user: response.data.user
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

  // 로그아웃 함수 - apiClient 사용으로 수정
  const logout = async () => {
    try {
      await apiClient.post('/api/auth/logout');
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasChecked: true
      });

      // 로그인 페이지로 리다이렉트
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 에러가 발생해도 로컬 상태는 초기화
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasChecked: true
      });
      window.location.href = '/';
    }
  };

  // 인증 상태 리셋
  const resetAuth = () => {
    console.log('AuthContext 상태 리셋 시작...');

    isCheckingRef.current = false;
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      hasChecked: false // 리셋 시 hasChecked도 false로
    });

    console.log('AuthContext 상태 리셋 완료');
  };

  // 강제 인증 재확인 함수 (OAuth2 콜백 후 사용)
  const forceCheckAuth = useCallback(async () => {
    console.log('강제 인증 재확인 시작...');

    // 상태 초기화
    setAuthState(prev => ({
      ...prev,
      hasChecked: false,
      isLoading: true
    }));

    // 새로운 인증 확인
    isCheckingRef.current = false;
    return await checkAuth();
  }, [checkAuth]);

  // 컴포넌트 마운트 시 한 번만 인증 확인
  useEffect(() => {
    debouncedCheckAuth();

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [debouncedCheckAuth]);

  // 페이지 포커스 시 인증 상태 재확인 (5분 간격)
  useEffect(() => {
    let lastCheck = Date.now();

    const handleFocus = () => {
      const now = Date.now();
      if (!authState.hasChecked || (now - lastCheck) > 5 * 60 * 1000) {
        console.log('페이지 포커스 - 인증 상태 재확인');
        lastCheck = now;
        debouncedCheckAuth();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [debouncedCheckAuth, authState.hasChecked]);

  // 전역 authContextReset 함수 등록 (apiClient에서 사용)
  useEffect(() => {
    window.authContextReset = resetAuth;

    return () => {
      delete window.authContextReset;
    };
  }, []);

  const value = {
    ...authState,
    checkAuth: debouncedCheckAuth,
    forceCheckAuth,
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
