import React from 'react';
import '../../styles/Login.css';

const Login = () => {
  return (
      <div className="login-container">
        <div className="login-form-wrapper">
          {/* Logo Section */}
          <div className="login-header">
            {/* 로고 이미지 자리 */}
            <div className="logo-placeholder">
              <span className="logo-text">로고 이미지</span>
            </div>
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

            {/* Login Button */}
            <button className="btn btn-primary">
              로그인
            </button>

            {/* Signup Button */}
            <button className="btn btn-secondary">
              회원가입
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="forgot-password">
            <button className="forgot-link">
              아이디/패스워드 찾기
            </button>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <div className="social-buttons">
              {/* 네이버 */}
              <button className="social-btn">
                <div className="social-icon naver">
                  <span>N</span>
                </div>
                <span className="social-label">네이버</span>
              </button>

              {/* 카카오 */}
              <button className="social-btn">
                <div className="social-icon kakao">
                  <div className="social-icon-inner kakao-inner">
                    <span>K</span>
                  </div>
                </div>
                <span className="social-label">카카오</span>
              </button>

              {/* 구글 */}
              <button className="social-btn">
                <div className="social-icon google">
                  <div className="social-icon-inner google-inner">
                    <span>G</span>
                  </div>
                </div>
                <span className="social-label">구글</span>
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Login;
