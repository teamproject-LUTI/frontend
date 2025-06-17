// AuthContext.js - 업데이트된 버전 (apiClient 연동)

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

  // 인증 상태 리셋 함수 (먼저 정의)
  const resetAuth = useCallback(() => {
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
  }, []);

  // AuthContext 리셋 함수를 전역에 등록 (apiClient에서 사용)
  useEffect(() => {
    window.authContextReset = () => {
      console.log('전역 AuthContext 리셋 호출');
      resetAuth();
    };

    // 컴포넌트 언마운트 시 전역 함수 제거
    return () => {
      delete window.authContextReset;
    };
  }, [resetAuth]);

  // 인증 상태 확인 함수
  const checkAuth = useCallback(async () => {
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
          console.warn('사용자 정보 조회 실패:', userError);
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

      // 401 에러가 아닌 경우에만 인증 실패로 처리
      // 401 에러는 apiClient 인터셉터에서 토큰 갱신 후 재시도됨
      if (error.response?.status !== 401) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          hasChecked: true
        });
      } else {
        // 401 에러인 경우 로딩 상태 유지하고 인터셉터의 결과를 기다림
        console.log('401 에러 - 인터셉터에서 토큰 갱신 처리 중...');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }

      return false;
    } finally {
      isCheckingRef.current = false;
    }
  }, [authState.hasChecked, authState.isAuthenticated]);

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
      console.log('사용자 정보 업데이트 시작:', updatedData);

      const updatedUser = {
        ...authState.user,
        ...updatedData
      };

      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));

      console.log('AuthContext 사용자 정보 업데이트 완료');
      return true;
    } catch (error) {
      console.error('사용자 정보 업데이트 중 오류:', error);
      return false;
    }
  }, [authState.user]);

  // 사용자 정보 새로고침 함수
  const refreshUser = useCallback(async () => {
    try {
      console.log('사용자 정보 새로고침 시작...');

      const userData = await authUtils.getUserInfo();
      if (userData && userData.success && userData.user) {
        setAuthState(prev => ({
          ...prev,
          user: userData.user
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

  // 로그아웃 함수
  const logout = async () => {
    try {
      console.log('로그아웃 처리 시작...');

      await authUtils.logout();

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasChecked: true
      });

      console.log('AuthContext 로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);

      // 오류가 있어도 로컬 상태는 정리
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        hasChecked: true
      });
    }
  };

  // 토큰 갱신 성공 시 인증 상태 업데이트 함수
  const onTokenRefresh = useCallback(async () => {
    console.log('토큰 갱신 후 인증 상태 업데이트...');

    try {
      const userData = await authUtils.getUserInfo();

      if (userData && userData.success) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: userData.user || null,
          hasChecked: true
        });

        console.log('토큰 갱신 후 인증 상태 업데이트 완료');
      }
    } catch (error) {
      console.error('토큰 갱신 후 사용자 정보 조회 실패:', error);
    }
  }, []);

  // 컴포넌트 마운트 시 한 번만 인증 확인
  useEffect(() => {
    debouncedCheckAuth();

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [debouncedCheckAuth]);

  // 페이지 포커스 시 인증 상태 재확인 (토큰이 만료되었을 가능성)
  useEffect(() => {
    const handleFocus = () => {
      // 5분마다 한 번씩만 재확인 (과도한 API 호출 방지)
      const lastCheck = localStorage.getItem('lastAuthCheck');
      const now = Date.now();

      if (!lastCheck || (now - parseInt(lastCheck)) > 5 * 60 * 1000) {
        console.log('페이지 포커스 - 인증 상태 재확인');
        localStorage.setItem('lastAuthCheck', now.toString());
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
    resetAuth,
    updateUser,
    refreshUser,
    onTokenRefresh
  };

  return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
  );
};
