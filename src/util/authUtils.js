// authUtils.js - 인증 관련 유틸리티 함수들

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// 인증 상태 캐시
let authCache = {
  isAuthenticated: null,
  lastChecked: null,
  cacheTimeout: 5 * 60 * 1000 // 5분
};

export const authUtils = {
  /**
   * 구글 소셜 로그인 시작
   */
  startGoogleLogin() {
    console.log('구글 로그인 시작 - OAuth2 리다이렉트');
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },

  /**
   * 카카오 소셜 로그인 시작
   */
  startKakaoLogin() {
    console.log('카카오 로그인 시작 - OAuth2 리다이렉트');
    window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`;
  },

  /**
   * 현재 사용자 정보 조회
   */
  async getUserInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      return null;
    }
  },

  /**
   * 토큰 갱신
   */
  async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('토큰 갱신 성공');
          return true;
        }
      }

      console.warn('토큰 갱신 실패:', response.status);
      return false;
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      return false;
    }
  },

  /**
   * 로그아웃
   */
  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('로그아웃 성공');
          // 캐시 초기화
          this.refreshCache();
          // 로그인 페이지로 리다이렉트
          window.location.href = '/';
          return true;
        }
      }

      console.warn('로그아웃 실패:', response.status);
      return false;
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      return false;
    }
  },

  /**
   * 모든 디바이스에서 로그아웃
   */
  async logoutFromAllDevices() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout-all`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('모든 디바이스 로그아웃 성공');
          // 캐시 초기화
          this.refreshCache();
          // 로그인 페이지로 리다이렉트
          window.location.href = '/';
          return true;
        }
      }

      console.warn('모든 디바이스 로그아웃 실패:', response.status);
      return false;
    } catch (error) {
      console.error('모든 디바이스 로그아웃 중 오류:', error);
      return false;
    }
  },

  /**
   * 토큰 유효성 검증
   */
  async validateToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.success && data.valid;
      }

      return false;
    } catch (error) {
      console.error('토큰 유효성 검증 중 오류:', error);
      return false;
    }
  },

  /**
   * 간단한 인증 상태 확인 (캐시 포함)
   */
  async isAuthenticated() {
    try {
      // 캐시 확인
      const now = Date.now();
      if (authCache.isAuthenticated !== null &&
          authCache.lastChecked &&
          (now - authCache.lastChecked) < authCache.cacheTimeout) {
        console.log('인증 상태 캐시 사용:', authCache.isAuthenticated);
        return authCache.isAuthenticated;
      }

      // 서버에서 인증 상태 확인
      const userInfo = await this.getUserInfo();
      const isAuth = !!(userInfo && userInfo.success && userInfo.user);

      // 캐시 업데이트
      authCache.isAuthenticated = isAuth;
      authCache.lastChecked = now;

      console.log('서버에서 인증 상태 확인:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('인증 상태 확인 중 오류:', error);

      // 오류 시 캐시 초기화
      authCache.isAuthenticated = false;
      let now;
      authCache.lastChecked = now;
      return false;
    }
  },

  /**
   * 인증 상태 확인 (사용자 정보 + 토큰 유효성)
   */
  async checkAuthStatus() {
    try {
      // 먼저 토큰 유효성 확인
      const isValidToken = await this.validateToken();
      if (!isValidToken) {
        console.log('토큰이 유효하지 않음');
        return { isAuthenticated: false, user: null };
      }

      // 사용자 정보 조회
      const userInfo = await this.getUserInfo();
      if (userInfo && userInfo.success && userInfo.user) {
        console.log('인증 상태 확인 성공:', userInfo.user);
        return { isAuthenticated: true, user: userInfo.user };
      }

      console.log('사용자 정보 조회 실패');
      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('인증 상태 확인 중 오류:', error);
      return { isAuthenticated: false, user: null };
    }
  },

  /**
   * 캐시 새로고침
   */
  refreshCache() {
    authCache.isAuthenticated = null;
    authCache.lastChecked = null;
    console.log('인증 캐시 초기화됨');
  },

  /**
   * 인증이 필요한 API 요청 시 자동 토큰 갱신을 포함한 fetch 래퍼
   */
  async authenticatedFetch(url, options = {}) {
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      // 첫 번째 시도
      let response = await fetch(url, defaultOptions);

      // 401 에러 시 토큰 갱신 후 재시도
      if (response.status === 401) {
        console.log('401 에러 - 토큰 갱신 시도');

        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          console.log('토큰 갱신 성공 - API 재시도');
          response = await fetch(url, defaultOptions);
        } else {
          console.log('토큰 갱신 실패 - 로그인 페이지로 리다이렉트');
          window.location.href = '/';
          return null;
        }
      }

      return response;
    } catch (error) {
      console.error('인증된 요청 중 오류:', error);
      throw error;
    }
  }
};
