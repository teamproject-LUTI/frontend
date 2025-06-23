import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoogleLoginButton from '../login/GoogleLoginButton';
import KakaoLoginButton from '../login/KakaoLoginButton';
import { authUtils } from '../../util/authUtils';
import '../../styles/login/Login.css';
import { useAuth } from "../../util/AuthContext";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null); // 'google' | 'kakao' | null
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  // 구글 로그인 핸들러
  const handleGoogleLogin = () => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingProvider('google');
    try {
      console.log('구글 로그인 시작');
      authUtils.startGoogleLogin();
    } catch (error) {
      console.error('구글 로그인 시작 중 오류:', error);
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingProvider('kakao');
    try {
      console.log('카카오 로그인 시작');
      authUtils.startKakaoLogin();
    } catch (error) {
      console.error('카카오 로그인 시작 중 오류:', error);
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 일반 로그인
  const handleRegularLogin = async () => {
    console.log('일반 로그인');
    setIsLoading(true);
    setLoadingProvider('regular');

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 쿠키 포함 필수
        body: JSON.stringify(loginForm)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('로그인 성공:', result);

        // 백엔드에서 tokenType으로 탈퇴 유무 구분
        if (result.tokenType === 'TEMP') {
          // 탈퇴한 계정 - 복구 페이지로 이동
          console.log('탈퇴한 계정 - 복구 페이지로 이동');
          window.location.href = result.redirectTo || '/account/restore';
        } else if (result.tokenType === 'NORMAL') {
          // 정상 로그인 - 메인 페이지로 이동
          console.log('정상 로그인 - 메인 페이지로 이동');
          window.location.href = '/main';
        } else {
          // tokenType이 없거나 예상치 못한 경우 기본 처리
          console.log('기본 처리 - 메인 페이지로 이동');
          window.location.href = '/main';
        }
      } else {
        alert(result.error || '로그인 실패');
      }
    } catch (error) {
      console.error('로그인 중 오류:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  // 회원가입 페이지로 이동
  const handleSignup = () => {
    navigate('/membership');
  }

  // 아이디 비밀번호 찾기 페이지로 이동
  const handleFindAccount = () => {
    navigate('/account/find');
  }

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
                  placeholder="Email"
                  className="form-input"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <input
                  type="password"
                  placeholder="Password"
                  className="form-input"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  disabled={isLoading}
              />
            </div>

            {/* Regular Login Button */}
            <button
                className="btn btn-primary"
                onClick={handleRegularLogin}
                disabled={isLoading}
            >
              {loadingProvider === 'regular' ? '로그인 중...' : '로그인'}
            </button>

            {/* Signup Button */}
            <button
                className="btn btn-secondary"
                onClick={handleSignup}
                disabled={isLoading}
            >
              회원가입
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <button className="forgot-link" disabled={isLoading} onClick={handleFindAccount}>
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
                  {loadingProvider === 'google' ? '로그인 중...' : '구글'}
                </GoogleLoginButton>
              </div>

              {/* 카카오 로그인 버튼 */}
              <div className="social-btn-wrapper">
                <KakaoLoginButton
                    onClick={handleKakaoLogin}
                    disabled={isLoading}
                    className="social-btn-kakao"
                >
                  {loadingProvider === 'kakao' ? '로그인 중...' : '카카오'}
                </KakaoLoginButton>
              </div>
            </div>
          </div>

          {/* 로딩 오버레이 */}
          {isLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>
                  {loadingProvider === 'google' && '구글 로그인 중...'}
                  {loadingProvider === 'kakao' && '카카오 로그인 중...'}
                  {loadingProvider === 'regular' && '로그인 중...'}
                  {!loadingProvider && '처리 중...'}
                </p>
              </div>
          )}
        </div>
      </div>
  );
};

export default Login;
