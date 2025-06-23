import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authUtils } from '../../util/authUtils';

/**
 * OAuth2 콜백 처리 컴포넌트
 * 카카오/구글 로그인 후 콜백 URL을 처리하고 적절한 페이지로 리다이렉트
 */
const OAuth2CallbackHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('로그인을 처리하고 있습니다...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('OAuth2 콜백 처리 시작:', location.pathname + location.search);

        // URL에서 code와 state 파라미터 추출
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // URL에서 제공자 정보 추출
        const provider = location.pathname.includes('kakao') ? 'kakao' :
            location.pathname.includes('google') ? 'google' : 'unknown';

        console.log('콜백 파라미터:', { code: !!code, state: !!state, error, provider });

        // 에러가 있는 경우 처리
        if (error) {
          console.error('OAuth2 에러:', error, errorDescription);
          setStatus('error');
          setMessage('로그인 중 오류가 발생했습니다.');

          // 에러 페이지로 리다이렉트
          const errorParams = new URLSearchParams({
            error: error,
            provider: provider
          });

          if (errorDescription) {
            errorParams.append('message', errorDescription);
          }

          setTimeout(() => {
            navigate(`/auth/error?${errorParams.toString()}`, { replace: true });
          }, 2000);
          return;
        }

        // code가 없는 경우
        if (!code) {
          console.error('Authorization code가 없습니다.');
          setStatus('error');
          setMessage('인증 코드를 받지 못했습니다.');

          setTimeout(() => {
            navigate('/auth/error?error=missing_code&provider=' + provider, { replace: true });
          }, 2000);
          return;
        }

        setMessage('로그인 처리 중...');

        // 백엔드에서 OAuth2 처리가 완료될 때까지 대기
        // Spring Security가 자동으로 처리하므로 인증 상태만 확인
        let attempts = 0;
        const maxAttempts = 30; // 15초 (500ms × 30)

        const checkAuthStatus = async () => {
          try {
            console.log(`인증 상태 확인 시도 ${attempts + 1}/${maxAttempts}`);

            const isAuth = await authUtils.isAuthenticated();

            if (isAuth) {
              console.log('로그인 성공 확인됨');
              setStatus('success');
              setMessage('로그인 성공! 메인 페이지로 이동합니다.');

              // 캐시 새로고침
              authUtils.refreshCache();

              setTimeout(() => {
                window.location.href = '/main';
              }, 1500);
              return true;
            }
            return false;
          } catch (error) {
            console.error('인증 상태 확인 중 오류:', error);
            return false;
          }
        };

        // 즉시 첫 번째 확인
        const immediateCheck = await checkAuthStatus();
        if (immediateCheck) return;

        // 폴링으로 인증 상태 확인
        const interval = setInterval(async () => {
          attempts++;

          const isAuthenticated = await checkAuthStatus();

          if (isAuthenticated) {
            clearInterval(interval);
            return;
          }

          if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.error('인증 상태 확인 타임아웃');
            setStatus('error');
            setMessage('로그인 처리 시간이 초과되었습니다.');

            // 일정 시간 후 에러 페이지로 이동
            setTimeout(() => {
              navigate(`/auth/error?error=timeout&provider=${provider}`, { replace: true });
            }, 2000);
          }
        }, 500);

        // 컴포넌트 언마운트 시 인터벌 정리
        return () => {
          if (interval) {
            clearInterval(interval);
          }
        };

      } catch (error) {
        console.error('OAuth2 콜백 처리 중 오류:', error);
        setStatus('error');
        setMessage('로그인 처리 중 오류가 발생했습니다.');

        setTimeout(() => {
          navigate('/auth/error?error=callback_error', { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  // 로딩 스피너 컴포넌트
  const LoadingSpinner = () => (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
  );

  return (
      <div className="oauth-callback-container">
        <div className="oauth-callback-content">
          <div className="callback-icon">
            {status === 'processing' && <LoadingSpinner />}
            {status === 'success' && <div className="success-icon">✓</div>}
            {status === 'error' && <div className="error-icon">⚠️</div>}
          </div>

          <h2 className="callback-title">
            {status === 'processing' && '로그인 처리 중'}
            {status === 'success' && '로그인 성공!'}
            {status === 'error' && '로그인 실패'}
          </h2>

          <p className="callback-message">{message}</p>

          {status === 'processing' && (
              <div className="progress-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
          )}

          {status === 'error' && (
              <div className="error-actions">
                <button
                    onClick={() => navigate('/', { replace: true })}
                    className="retry-button"
                >
                  로그인 페이지로 돌아가기
                </button>
              </div>
          )}
        </div>

        <style jsx>{`
        .oauth-callback-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .oauth-callback-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 60px 40px;
          text-align: center;
          max-width: 400px;
          width: 90%;
        }

        .callback-icon {
          margin-bottom: 24px;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-spinner {
          display: inline-block;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #F76B59;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .success-icon {
          width: 60px;
          height: 60px;
          background-color: #10b981;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          animation: scaleIn 0.5s ease-out;
        }

        .error-icon {
          font-size: 48px;
          animation: shake 0.5s ease-out;
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .callback-title {
          color: #2d3748;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 16px 0;
        }

        .callback-message {
          color: #4a5568;
          font-size: 16px;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .progress-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          background-color: #F76B59;
          border-radius: 50%;
          animation: bounce 1.4s ease-in-out infinite both;
        }

        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        .dot:nth-child(3) { animation-delay: 0s; }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }

        .error-actions {
          margin-top: 24px;
        }

        .retry-button {
          padding: 12px 24px;
          background-color: #F76B59;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          background-color: #e55a48;
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .oauth-callback-content {
            padding: 40px 20px;
            margin: 20px;
          }
          
          .callback-title {
            font-size: 20px;
          }
          
          .callback-message {
            font-size: 14px;
          }
        }
      `}</style>
      </div>
  );
};

export default OAuth2CallbackHandler;
