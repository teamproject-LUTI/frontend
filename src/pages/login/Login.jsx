import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../login/GoogleLoginButton';
import { authUtils } from '../../util/authUtils';
import '../../styles/login/Login.css';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 🚨 인증 상태 확인 useEffect 완전 제거!
  // 로그인 페이지에서는 인증 체크를 하지 않습니다.

  // 구글 로그인 핸들러
  const handleGoogleLogin = () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      console.log('구글 로그인 시작');
      authUtils.startGoogleLogin();
    } catch (error) {
      console.error('구글 로그인 시작 중 오류:', error);
      setIsLoading(false);
    }
  };

  // 일반 로그인 (향후 구현)
  const handleRegularLogin = () => {
    console.log('일반 로그인 - 팀원이 구현할 예정');
    // TODO: 일반 로그인 로직 구현
  };

  // 회원가입 페이지로 이동
  const handleSignup = () => {
    navigate('/membership');
  };

  return (
      <div className="login-container">
        <div className="login-form-wrapper">
          {/* Logo Section */}
          <div className="login-header">
            <img src="/images/topbar/luti_logo.png" alt="LUTI Logo" className="logo-image"/>
            <p className="tagline">Let's Use Travel Intelligence</p>
          </div>

          {/* Login Form */}
          <div className="login-form">
            <div className="form-group">
              <input
                  type="text"
                  placeholder="Email or phone number"
                  className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                  type="password"
                  placeholder="Password"
                  className="form-input"
              />
            </div>

            {/* Regular Login Button */}
            <button
                className="btn btn-primary"
                onClick={handleRegularLogin}
            >
              로그인
            </button>

            {/* Signup Button */}
            <button
                className="btn btn-secondary"
                onClick={handleSignup}
            >
              회원가입
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <button className="forgot-link">
              아이디/패스워드 찾기
            </button>
          </div>

          {/* Divider */}
          <div className="login-divider">
            <span></span>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <div className="social-buttons">
              {/* 구글 로그인 버튼 */}
              <div className="social-btn-wrapper">
                <GoogleLoginButton
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="social-btn-google"
                >
                  {isLoading ? '로그인 중...' : '구글'}
                </GoogleLoginButton>
              </div>

              {/* 카카오 (향후 구현) */}
              <button className="social-btn" disabled>
                <div className="social-icon kakao">
                  <div className="social-icon-inner kakao-inner">
                    <span>K</span>
                  </div>
                </div>
                <span className="social-label">카카오</span>
              </button>
            </div>
          </div>

          {/* 로딩 오버레이 */}
          {isLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>구글 로그인 중...</p>
              </div>
          )}
        </div>
      </div>
  );
};

export default Login;
