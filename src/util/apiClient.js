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
    // 성공 응답은 그대로 반환
    (response) => {
      return response;
    },

    // 에러 응답 처리
    async (error) => {
      const originalRequest = error.config;

      // 401 에러이고, 아직 재시도하지 않은 요청인 경우
      if (error.response?.status === 401 && !originalRequest._retry) {

        // 이미 토큰 갱신 중이면 큐에 추가
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            // 토큰 갱신 완료 후 원래 요청 재시도
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        // 재시도 플래그 설정
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('401 에러 감지 - 토큰 갱신 시작');

          const refreshSuccess = await refreshToken();

          if (refreshSuccess) {
            console.log('토큰 갱신 성공 - 원래 요청 재시도');

            // 대기 중인 요청들 성공 처리
            processQueue(null, 'success');

            // 원래 요청 재시도
            return apiClient(originalRequest);
          } else {
            console.log('토큰 갱신 실패 - 로그아웃 필요');

            // 대기 중인 요청들 실패 처리
            processQueue(error, null);

            // 로그아웃 처리
            handleLogout();

            return Promise.reject(error);
          }
        } catch (refreshError) {
          console.error('토큰 갱신 중 예외:', refreshError);

          // 대기 중인 요청들 실패 처리
          processQueue(refreshError, null);

          // 로그아웃 처리
          handleLogout();

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // 기타 에러는 그대로 반환
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
