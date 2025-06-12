import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

/**
 * OAuth2 로그인 실패 시 표시되는 에러 페이지
 */
const OAuth2ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const errorCode = searchParams.get('error');
  const errorMessage = searchParams.get('message');

  // 자동 리다이렉트 카운트다운
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleRetryLogin = () => {
    navigate('/', { replace: true });
  };

  const handleContactSupport = () => {
    // 고객 지원 페이지로 이동 또는 이메일 링크
    window.location.href = 'mailto:support@luti.com?subject=소셜 로그인 오류 문의';
  };

  // 에러 코드에 따른 상세 메시지 및 해결 방법 제공
  const getErrorDetails = (code) => {
    switch (code) {
      case 'access_denied':
        return {
          title: '로그인이 취소되었습니다',
          description: '구글 로그인 과정에서 권한 승인을 거부하셨습니다.',
          solution: '다시 시도하시고, 구글 계정 접근 권한을 허용해주세요.'
        };
      case 'email_already_exists':
        return {
          title: '이미 가입된 이메일입니다',
          description: '해당 이메일로 이미 계정이 존재합니다.',
          solution: '기존 계정으로 로그인하시거나, 다른 이메일을 사용해주세요.'
        };
      case 'server_error':
        return {
          title: '서버 오류가 발생했습니다',
          description: '일시적인 서버 문제로 로그인에 실패했습니다.',
          solution: '잠시 후 다시 시도해주세요. 문제가 지속되면 고객지원에 문의해주세요.'
        };
      case 'invalid_request':
        return {
          title: '잘못된 요청입니다',
          description: '로그인 요청에 문제가 있습니다.',
          solution: '페이지를 새로고침하고 다시 시도해주세요.'
        };
      case 'system_configuration_error':
        return {
          title: '시스템 설정 오류',
          description: '서비스 설정에 문제가 있습니다.',
          solution: '관리자에게 문의해주세요.'
        };
      default:
        return {
          title: '소셜 로그인 오류',
          description: '로그인 중 알 수 없는 오류가 발생했습니다.',
          solution: '다시 시도해주시고, 문제가 지속되면 고객지원에 문의해주세요.'
        };
    }
  };

  const errorDetails = getErrorDetails(errorCode);
  const decodedMessage = errorMessage ? decodeURIComponent(errorMessage) : errorDetails.description;

  return (
      <div className="oauth-error-container">
        <div className="oauth-error-content">
          {/* 에러 아이콘 */}
          <div className="error-icon-container">
            <div className="error-icon">⚠️</div>
          </div>

          {/* 에러 제목 */}
          <h1 className="error-title">{errorDetails.title}</h1>

          {/* 에러 메시지 */}
          <div className="error-message">
            <p className="error-description">{decodedMessage}</p>
            {errorDetails.solution && (
                <p className="error-solution">💡 {errorDetails.solution}</p>
            )}
          </div>

          {/* 에러 코드 (개발자용) */}
          {errorCode && (
              <div className="error-code-container">
                <span className="error-code">오류 코드: {errorCode}</span>
              </div>
          )}

          {/* 액션 버튼들 */}
          <div className="error-actions">
            <button onClick={handleRetryLogin} className="retry-button primary">
              다시 로그인하기
            </button>

            <button onClick={handleContactSupport} className="support-button secondary">
              고객지원 문의
            </button>
          </div>

          {/* 자동 리다이렉트 안내 */}
          <div className="auto-redirect">
            <p>
              {countdown}초 후 자동으로 로그인 페이지로 이동합니다.
            </p>
          </div>

          {/* 추가 도움말 */}
          <div className="help-section">
            <details>
              <summary>자주 발생하는 문제 해결 방법</summary>
              <div className="help-content">
                <ul>
                  <li><strong>팝업 차단:</strong> 브라우저의 팝업 차단을 해제해주세요.</li>
                  <li><strong>쿠키 설정:</strong> 브라우저에서 쿠키를 허용해주세요.</li>
                  <li><strong>캐시 문제:</strong> 브라우저 캐시를 삭제하고 다시 시도해주세요.</li>
                  <li><strong>다른 브라우저:</strong> 다른 브라우저나 시크릿 모드를 시도해보세요.</li>
                </ul>
              </div>
            </details>
          </div>
        </div>

        <style jsx>{`
        .oauth-error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .oauth-error-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
          max-width: 500px;
          width: 100%;
          text-align: center;
          position: relative;
        }

        .error-icon-container {
          margin-bottom: 24px;
        }

        .error-icon {
          font-size: 64px;
          display: inline-block;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        .error-title {
          color: #2d3748;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 20px 0;
          line-height: 1.3;
        }

        .error-message {
          margin-bottom: 24px;
        }

        .error-description {
          color: #4a5568;
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 12px 0;
        }

        .error-solution {
          color: #38a169;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
          padding: 12px;
          background-color: #f0fff4;
          border-radius: 8px;
          border-left: 4px solid #38a169;
        }

        .error-code-container {
          margin-bottom: 24px;
        }

        .error-code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          background-color: #f7fafc;
          color: #e53e3e;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          border: 1px solid #fed7d7;
        }

        .error-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .retry-button, .support-button {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          text-decoration: none;
        }

        .retry-button.primary {
          background-color: #F76B59;
          color: white;
        }

        .retry-button.primary:hover {
          background-color: #e55a48;
          transform: translateY(-1px);
        }

        .support-button.secondary {
          background-color: #edf2f7;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .support-button.secondary:hover {
          background-color: #e2e8f0;
          transform: translateY(-1px);
        }

        .auto-redirect {
          margin-bottom: 20px;
          padding: 12px;
          background-color: #ebf8ff;
          border-radius: 8px;
          border: 1px solid #bee3f8;
        }

        .auto-redirect p {
          color: #2b6cb0;
          font-size: 13px;
          margin: 0;
        }

        .help-section {
          margin-top: 20px;
        }

        .help-section details {
          text-align: left;
        }

        .help-section summary {
          color: #4a5568;
          font-size: 14px;
          cursor: pointer;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .help-section summary:hover {
          color: #2d3748;
        }

        .help-content {
          padding: 16px 0 0 0;
        }

        .help-content ul {
          margin: 0;
          padding-left: 20px;
        }

        .help-content li {
          color: #4a5568;
          font-size: 13px;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .help-content strong {
          color: #2d3748;
        }

        /* 모바일 반응형 */
        @media (max-width: 480px) {
          .oauth-error-content {
            padding: 30px 20px;
            margin: 10px;
          }

          .error-title {
            font-size: 20px;
          }

          .error-description {
            font-size: 14px;
          }

          .error-actions {
            flex-direction: column;
          }

          .retry-button, .support-button {
            width: 100%;
          }
        }
      `}</style>
      </div>
  );
};

export default OAuth2ErrorPage;
