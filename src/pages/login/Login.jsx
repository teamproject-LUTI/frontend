import React, { useEffect, useState } from 'react';
import GoogleLoginButton from '../login/GoogleLoginButton';
import { authUtils } from '../../util/authUtils';
import { useAuth } from '../../util/AuthContext';
import '../../styles/login/Login.css';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // AuthContext에서 관리하는 인증 상태를 사용
  useEffect(() => {
    // AuthContext가 인증 확인을 완료한 후에만 처리
    if (!authLoading && isAuthenticated) {
      console.log('인증된 사용자 - 메인 페이지로 리다이렉트');
      // 현재 경로가 루트가 아닌 경우에만 리다이렉트 (무한 리다이렉트 방지)
      if (window.location.pathname === '/' || window.location.pathname === '/login') {
        window.location.href = '/main';
      }
    }
  }, [isAuthenticated, authLoading]);

  // AuthContext의 로딩 상태를 사용
  if (authLoading) {
    return (
        <div className="login-container">
          <div className="login-form-wrapper">
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
              <p>인증 상태 확인 중...</p>
            </div>
          </div>
        </div>
    );
  }

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
    window.location.href = '/membership';
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
