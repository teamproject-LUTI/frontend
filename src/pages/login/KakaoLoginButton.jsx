import React from 'react';
import '../../styles/login/KakaoLoginButton.css';

/**
 * 카카오 소셜 로그인 버튼 컴포넌트
 */
const KakaoLoginButton = ({
                            onClick,
                            disabled = false,
                            className = '',
                            children = '카카오로 로그인'
                          }) => {

  const handleClick = () => {
    if (disabled) return;

    if (onClick) {
      onClick();
    } else {
      // 카카오 OAuth2 로그인 URL로 리다이렉트
      window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/oauth2/authorization/kakao`;
    }
  };

  return (
      <button
          className={`kakao-login-button ${className} ${disabled ? 'disabled' : ''}`}
          onClick={handleClick}
          disabled={disabled}
          type="button"
      >
        <div className="kakao-login-content">
          <div className="kakao-icon">
            {/* 카카오 로고 아이콘 */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9 0C4.03125 0 0 2.90625 0 6.5C0 8.59375 1.21875 10.4375 3.09375 11.5625L2.15625 15.4375C2.09375 15.6875 2.40625 15.875 2.625 15.7188L7.40625 12.9375C7.9375 12.9688 8.46875 13 9 13C13.9688 13 18 10.0938 18 6.5C18 2.90625 13.9688 0 9 0Z"
                  fill="#3C1E1E"
              />
            </svg>
          </div>
          <span className="kakao-login-text">{children}</span>
        </div>
      </button>
  );
};

export default KakaoLoginButton;
