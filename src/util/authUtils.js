import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // HttpOnly 쿠키 자동 포함
  headers: {
    'Content-Type': 'application/json',
  },
});

// 토큰 갱신 진행 중인지 확인하는 플래그
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 응답 인터셉터 - 401 에러 시 토큰 갱신 시도
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // 401 에러이고, 재시도 플래그가 없으며, refresh 엔드포인트가 아닌 경우에만 처리
      if (error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/api/auth/refresh') &&
          !originalRequest.url?.includes('/api/auth/validate')) {

        // 이미 토큰 갱신 중이면 대기열에 추가
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // 토큰 갱신 시도
          await apiClient.post('/api/auth/refresh');
          processQueue(null, true);

          // 갱신 성공 시 원래 요청 재시도
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 갱신 실패 시 로그인 페이지로 리다이렉트
          processQueue(refreshError, null);
          console.error('토큰 갱신 실패:', refreshError);
          authUtils.redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
);

/**
 * 인증 관련 유틸리티 (axios 기반)
 */
export const authUtils = {
  // 토큰 갱신 (서버의 HttpOnly 쿠키가 자동 처리)
  refreshToken: async () => {
    try {
      const response = await apiClient.post('/api/auth/refresh');
      return { success: response.status === 200 };
    } catch (error) {
      console.error('토큰 갱신 중 오류:', error);
      return { success: false, error: error.message };
    }
  },

  // 로그아웃
  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      // 로컬 사용자 정보 삭제 및 로그인 페이지로 이동
      authUtils.clearUserInfo();
      authUtils.redirectToLogin();
    }
  },

  // 모든 디바이스에서 로그아웃
  logoutFromAllDevices: async () => {
    try {
      await apiClient.post('/api/auth/logout-all');
    } catch (error) {
      console.error('전체 로그아웃 중 오류:', error);
    } finally {
      authUtils.clearUserInfo();
      authUtils.redirectToLogin();
    }
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');

      if (response.data.success) {
        // 민감하지 않은 정보만 세션스토리지에 저장
        authUtils.setUserInfo(response.data.user);
        return response.data.user;
      }

      return null;
    } catch (error) {
      console.error('사용자 정보 조회 중 오류:', error);
      return null;
    }
  },

  // 로그인 상태 확인 (서버에 검증 요청) - 인터셉터 제외
  isAuthenticated: async () => {
    try {
      // 직접 fetch 사용하여 인터셉터 우회
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('인증 확인 중 오류:', error);
      return false;
    }
  },

  // 로그인 페이지로 리다이렉트
  redirectToLogin: () => {
    // 현재 페이지가 이미 로그인 페이지가 아닌 경우에만 리다이렉트
    if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
      window.location.href = '/';
    }
  },

  // 구글 로그인 시작
  startGoogleLogin: () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },

  // 사용자 정보 관리 (민감하지 않은 정보만)
  setUserInfo: (userInfo) => {
    const safeUserInfo = {
      userId: userInfo.userId,
      name: userInfo.name,
      nickname: userInfo.nickname,
      email: userInfo.email,
      profileImageUrl: userInfo.profileImageUrl,
      socialProvider: userInfo.socialProvider,
      userTypeId: userInfo.userTypeId,
      // 토큰이나 민감한 정보는 저장하지 않음
    };
    sessionStorage.setItem('userInfo', JSON.stringify(safeUserInfo));
  },

  getUserInfo: () => {
    try {
      const userString = sessionStorage.getItem('userInfo');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('사용자 정보 파싱 중 오류:', error);
      return null;
    }
  },

  clearUserInfo: () => {
    sessionStorage.removeItem('userInfo');
  }
};

/**
 * API 호출용 axios 인스턴스 (다른 컴포넌트에서 사용)
 */
export const api = apiClient;

/**
 * 인증 상태 변화 이벤트 시스템
 */
export const authEvents = {
  emit: (eventType, data) => {
    window.dispatchEvent(new CustomEvent(`auth:${eventType}`, { detail: data }));
  },

  on: (eventType, callback) => {
    const handler = (event) => callback(event.detail);
    window.addEventListener(`auth:${eventType}`, handler);
    return () => window.removeEventListener(`auth:${eventType}`, handler);
  },

  emitLoginSuccess: (user) => {
    authEvents.emit('loginSuccess', user);
  },

  emitLogout: () => {
    authEvents.emit('logout');
  }
};

export const tokenUtils = {
  setAccessToken: () => {
    console.warn('HttpOnly 쿠키 사용으로 인해 더 이상 토큰을 직접 저장하지 않습니다.');
  },

  getAccessToken: () => {
    console.warn('HttpOnly 쿠키 사용으로 인해 토큰에 직접 접근할 수 없습니다.');
    return null;
  },

  removeTokens: () => {
    // 쿠키는 서버에서 만료시키므로 여기서는 사용자 정보만 삭제
    authUtils.clearUserInfo();
  }
};

export default apiClient;
