import apiClient from './apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const authUtils = {
  /**
   * 사용자 인증 상태 확인
   * apiClient를 사용하여 자동 토큰 갱신 적용
   */
  async isAuthenticated() {
    try {
      const response = await apiClient.get('/api/auth/validate');

      if (response.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      // 401 에러든 다른 에러든 false 반환 (무한 루프 방지)
      console.error('인증 확인 실패:', error.response?.status);
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
   * apiClient를 사용하여 자동 토큰 갱신 적용
   */
  async logout() {
    try {
      console.log('로그아웃 요청 시작...');

      const response = await apiClient.post('/api/auth/logout');

      if (response.status === 200) {
        const result = response.data;
        console.log('서버 로그아웃 성공');

        return {
          success: true,
          message: result.message || '로그아웃이 완료되었습니다.'
        };
      } else {
        console.log('서버 응답 에러이지만 로그아웃 처리');
        return {
          success: true,
          message: '로그아웃이 완료되었습니다.'
        };
      }
    } catch (error) {
      console.error('로그아웃 요청 중 오류:', error);

      // 로그아웃은 항상 성공으로 처리 (프론트엔드 세션 정리)
      return {
        success: true,
        message: '로그아웃이 완료되었습니다.'
      };
    }
  },

  /**
   * 사용자 정보 조회
   * apiClient를 사용하여 자동 토큰 갱신 적용
   */
  async getUserInfo() {
    try {
      console.log('사용자 정보 조회 중...');

      const response = await apiClient.get('/api/auth/me');

      if (response.status === 200) {
        const data = response.data;
        console.log('사용자 정보 조회 성공');
        return data; // { success: true, user: {...} }
      } else {
        console.log('사용자 정보 조회 실패');
        return null;
      }
    } catch (error) {
      console.error('사용자 정보 조회 중 오류:', error);

      // 401 에러는 인터셉터에서 처리
      if (error.response?.status === 401) {
        console.log('401 에러 - 인터셉터에서 토큰 갱신 처리됨');
      }

      return null;
    }
  },

  /**
   * 토큰 갱신 (수동 호출용)
   * 일반적으로는 인터셉터에서 자동 처리되지만 필요시 수동 호출 가능
   */
  async refreshToken() {
    try {
      console.log('수동 토큰 갱신 요청...');

      const response = await apiClient.post('/api/auth/refresh');

      if (response.status === 200) {
        const result = response.data;
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
  },

  /**
   * 캐시 새로고침 (필요시 사용)
   */
  refreshCache() {
    console.log('authUtils 캐시 새로고침');
  }
};
