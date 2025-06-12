// authUtils.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const authUtils = {
  /**
   * 사용자 인증 상태 확인
   * @returns {Promise<boolean>} 인증 여부
   */
  async isAuthenticated() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/validate`, {
        withCredentials: true,
        // 401 에러를 콘솔에 표시하지 않도록 설정
        validateStatus: function (status) {
          // 200-299 범위와 401도 성공으로 처리 (에러로 던지지 않음)
          return (status >= 200 && status < 300) || status === 401;
        }
      });

      if (response.status === 200) {
        console.log('사용자 인증됨');
        return true;
      } else if (response.status === 401) {
        // 401은 정상적인 응답으로 처리 (에러 로그 없음)
        console.log('사용자 미인증 상태');
        return false;
      }

      return false;
    } catch (error) {
      // 네트워크 에러나 기타 예외적인 에러만 로그에 표시
      console.error('인증 상태 확인 중 예외 발생:', error.message);
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
        withCredentials: true
      });

      if (response.status === 200) {
        console.log('로그아웃 성공');
        // 로그아웃 후 로그인 페이지로 리다이렉트
        window.location.href = '/';
        return true;
      }

      return false;
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      return false;
    }
  },

  /**
   * 사용자 정보 조회
   * @returns {Promise<Object|null>} 사용자 정보 또는 null
   */
  async getUserInfo() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/user`, {
        withCredentials: true,
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
  }
};
