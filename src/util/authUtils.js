// authUtils.js - 쿠키 기반 JWT용 간소화 버전

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const authUtils = {
  /**
   * 사용자 인증 상태 확인
   * 쿠키의 accessToken을 자동으로 서버에 전송하여 검증
   */
  async isAuthenticated() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: 'GET',
        credentials: 'include', // 쿠키 자동 전송
        headers: {
          'Content-Type': 'application/json',
        },
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
      console.error('인증 상태 확인 중 오류:', error);
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
      window.location.href = loginUrl;
    } catch (error) {
      console.error('구글 로그인 시작 중 오류:', error);
      throw error;
    }
  },

  /**
   * 로그아웃 처리
   * 서버에서 쿠키를 자동으로 삭제함
   */
  async logout() {
    try {
      console.log('로그아웃 요청 시작...');

      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // 쿠키 자동 전송
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('서버 로그아웃 성공');

        return {
          success: true,
          message: result.message || '로그아웃이 완료되었습니다.'
        };
      } else {
        // 서버 에러가 있어도 프론트엔드에서는 성공으로 처리
        console.log('서버 응답 에러이지만 로그아웃 처리');
        return {
          success: true,
          message: '로그아웃이 완료되었습니다.'
        };
      }

    } catch (error) {
      console.error('로그아웃 요청 중 오류:', error);

      return {
        success: true,
        message: '로그아웃이 완료되었습니다.'
      };
    }
  },

  /**
   * 사용자 정보 조회
   */
  async getUserInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // 쿠키 자동 전송
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data = await response.json();
        return data; // { success: true, user: {...} }
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
   * 토큰 갱신 (필요한 경우)
   * 보통 axios interceptor나 자동으로 처리되지만, 수동 호출용
   */
  async refreshToken() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('토큰 갱신 성공');
        return { success: true, message: result.message };
      } else {
        console.log('토큰 갱신 실패');
        return { success: false, error: '토큰 갱신에 실패했습니다.' };
      }
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      return { success: false, error: '토큰 갱신 중 오류가 발생했습니다.' };
    }
  }
};
