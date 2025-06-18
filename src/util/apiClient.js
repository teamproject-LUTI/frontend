import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키 자동 전송
  timeout: 30000, // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  }
});

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedQueue = [];

// 실패한 요청들을 큐에서 처리하는 함수
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// 토큰 갱신 함수
const refreshToken = async () => {
  try {
    console.log('토큰 갱신 시도...');

    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {}, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 200) {
      console.log('토큰 갱신 성공');
      return true;
    } else {
      console.log('토큰 갱신 실패:', response.status);
      return false;
    }
  } catch (error) {
    console.error('토큰 갱신 중 오류:', error);
    return false;
  }
};

// Response 인터셉터 - 401 에러 시 자동 토큰 갱신
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshSuccess = await refreshToken();

          if (refreshSuccess) {
            processQueue(null, 'success');
            return apiClient(originalRequest);
          } else {
            // 토큰 갱신 실패 시 즉시 로그아웃 처리
            processQueue(error, null);
            handleLogout();
            return Promise.reject(error); // 무한 루프 방지
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          handleLogout();
          return Promise.reject(refreshError); // 무한 루프 방지
        } finally {
          isRefreshing = false;
        }
      }

      // 401이 아니거나 이미 재시도한 경우
      return Promise.reject(error);
    }
);

// 로그아웃 처리 함수
const handleLogout = () => {
  console.log('자동 로그아웃 처리');

  // AuthContext 초기화 (전역 상태 관리)
  if (window.authContextReset) {
    window.authContextReset();
  }

  // 로그인 페이지로 리다이렉트
  setTimeout(() => {
    window.location.href = '/';
  }, 100);
};

// Request 인터셉터 - 요청 로깅 (선택사항)
apiClient.interceptors.request.use(
    (config) => {
      console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      console.error('API 요청 오류:', error);
      return Promise.reject(error);
    }
);

export default apiClient;
