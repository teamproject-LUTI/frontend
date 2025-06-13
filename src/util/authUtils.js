// authUtils.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// 요청 중복 방지를 위한 캐시
let authCheckCache = {
  promise: null,
  timestamp: null,
  result: null
};

// 사용자 정보 캐시
let userInfoCache = {
  promise: null,
  timestamp: null,
  result: null
};

// 캐시 유효 시간 (30초)
const CACHE_DURATION = 30 * 1000;

export const authUtils = {
  /**
   * 사용자 인증 상태 확인 (캐싱 적용)
   * @returns {Promise<boolean>} 인증 여부
   */
  async isAuthenticated() {
    const now = Date.now();

    // 캐시가 유효하고 결과가 있으면 반환
    if (authCheckCache.result !== null &&
        authCheckCache.timestamp &&
        (now - authCheckCache.timestamp) < CACHE_DURATION) {
      console.log('인증 상태 캐시 사용');
      return authCheckCache.result;
    }

    // 이미 요청 중이면 같은 Promise 반환
    if (authCheckCache.promise) {
      console.log('인증 확인 요청 중 - 기존 Promise 사용');
      return authCheckCache.promise;
    }

    // 새로운 요청 생성
    authCheckCache.promise = this._performAuthCheck();

    try {
      const result = await authCheckCache.promise;

      // 캐시 업데이트
      authCheckCache.result = result;
      authCheckCache.timestamp = now;

      return result;
    } catch (error) {
      // 에러 발생 시 캐시 초기화
      authCheckCache.result = false;
      authCheckCache.timestamp = now;
      throw error;
    } finally {
      // Promise 정리
      authCheckCache.promise = null;
    }
  },

  /**
   * 실제 인증 확인 수행
   * @private
   */
  async _performAuthCheck() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/validate`, {
        withCredentials: true,
        timeout: 5000, // 5초 타임아웃
        validateStatus: function (status) {
          return (status >= 200 && status < 300) || status === 401;
        }
      });

      if (response.status === 200) {
        console.log('사용자 인증됨');
        return true;
      } else if (response.status === 401) {
        console.log('사용자 미인증 상태');
        return false;
      }

      return false;
    } catch (error) {
      // 네트워크 에러나 타임아웃 등의 예외적인 에러만 로그에 표시
      if (error.code === 'ECONNABORTED') {
        console.error('인증 확인 타임아웃:', error.message);
      } else if (error.code === 'ERR_NETWORK') {
        console.error('네트워크 오류:', error.message);
      } else {
        console.error('인증 상태 확인 중 예외 발생:', error.message);
      }
      return false;
    }
  },

  /**
   * 구글 OAuth2 로그인 시작
   */
  startGoogleLogin() {
    try {
      const loginUrl = `${API_BASE_URL}/oauth2/authorization/google`;
      console.log('구글 로그인 시작:', loginUrl);

      // 현재 페이지를 구글 로그인 페이지로 리다이렉트
      window.location.href = loginUrl;
    } catch (error) {
      console.error('구글 로그인 시작 중 오류:', error);
      throw error;
    }
  },

  /**
   * 로그아웃 처리
   * @returns {Promise<boolean>} 로그아웃 성공 여부
   */
  async logout() {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true,
        timeout: 5000
      });

      if (response.status === 200) {
        console.log('로그아웃 성공');

        // 캐시 초기화
        this._clearCache();

        // 로그아웃 후 로그인 페이지로 리다이렉트
        window.location.href = '/';
        return true;
      }

      return false;
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      // 에러가 발생해도 캐시는 초기화
      this._clearCache();
      return false;
    }
  },

  /**
   * 사용자 정보 조회 (캐싱 적용)
   * @returns {Promise<Object|null>} 사용자 정보 또는 null
   */
  async getUserInfo() {
    const now = Date.now();

    // 캐시가 유효하고 결과가 있으면 반환
    if (userInfoCache.result !== null &&
        userInfoCache.timestamp &&
        (now - userInfoCache.timestamp) < CACHE_DURATION) {
      console.log('사용자 정보 캐시 사용');
      return userInfoCache.result;
    }

    // 이미 요청 중이면 같은 Promise 반환
    if (userInfoCache.promise) {
      console.log('사용자 정보 요청 중 - 기존 Promise 사용');
      return userInfoCache.promise;
    }

    // 새로운 요청 생성
    userInfoCache.promise = this._performUserInfoFetch();

    try {
      const result = await userInfoCache.promise;

      // 캐시 업데이트
      userInfoCache.result = result;
      userInfoCache.timestamp = now;

      return result;
    } catch (error) {
      // 에러 발생 시 캐시 초기화
      userInfoCache.result = null;
      userInfoCache.timestamp = now;
      throw error;
    } finally {
      // Promise 정리
      userInfoCache.promise = null;
    }
  },

  /**
   * 실제 사용자 정보 조회 수행
   * @private
   */
  async _performUserInfoFetch() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
        timeout: 5000,
        validateStatus: function (status) {
          return (status >= 200 && status < 300) || status === 401;
        }
      });

      if (response.status === 200) {
        return response.data;
      } else if (response.status === 401) {
        console.log('사용자 정보 조회 - 미인증 상태');
        return null;
      }

      return null;
    } catch (error) {
      console.error('사용자 정보 조회 중 오류:', error);
      return null;
    }
  },

  /**
   * 캐시 초기화
   * @private
   */
  _clearCache() {
    authCheckCache = {
      promise: null,
      timestamp: null,
      result: null
    };

    userInfoCache = {
      promise: null,
      timestamp: null,
      result: null
    };

    console.log('authUtils 캐시 초기화됨');
  },

  /**
   * 캐시 강제 새로고침
   */
  refreshCache() {
    this._clearCache();
    console.log('authUtils 캐시가 강제로 새로고침됨');
  }
};
