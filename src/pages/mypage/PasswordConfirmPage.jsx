import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../util/AuthContext';
import '../../styles/MyPage/PasswordConfirmPage.css';

const PasswordConfirmPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 소셜 로그인 사용자는 이 페이지에 접근할 수 없음
  useEffect(() => {
    if (user && user.provider && user.provider !== 'LOCAL') {
      // 소셜 로그인 사용자는 바로 탈퇴 페이지로 이동
      navigate('/mypage/withdraw', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 비밀번호를 상태로 전달하면서 탈퇴 페이지로 이동
      navigate('/mypage/withdraw', {
        state: {
          confirmedPassword: password,
          isPasswordConfirmed: true
        }
      });
    } catch (error) {
      console.error('페이지 이동 오류:', error);
      setError('페이지 이동 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/mypage');
  };

  return (
      <Layout>
        <div className="password-confirm-container">
          <div className="password-confirm-content">
            {/* 헤더 */}
            <div className="password-confirm-header">
              <button onClick={handleGoBack} className="password-confirm-back-button">
                <ArrowLeft size={20} />
                <span>돌아가기</span>
              </button>
              <div className="password-confirm-title">
                <Lock className="password-confirm-icon" />
                <h1>비밀번호 확인</h1>
              </div>
            </div>

            {/* 안내 메시지 */}
            <div className="password-confirm-info-section">
              <Shield className="password-confirm-info-icon" />
              <div className="password-confirm-info-content">
                <h3>본인 확인을 위해 비밀번호를 입력해주세요</h3>
                <p>회원탈퇴를 위해 현재 계정의 비밀번호를 확인합니다.</p>
              </div>
            </div>

            {/* 경고 메시지 */}
            <div className="password-confirm-warning-section">
              <AlertTriangle className="password-confirm-warning-icon" />
              <div className="password-confirm-warning-content">
                <p>비밀번호 확인 후 회원탈퇴 절차가 진행됩니다.</p>
              </div>
            </div>

            {/* 비밀번호 입력 폼 */}
            <div className="password-confirm-form-section">
              <form onSubmit={handleSubmit}>
                <div className="password-confirm-input-group">
                  <label htmlFor="password" className="password-confirm-label">
                    현재 비밀번호
                  </label>
                  <div className="password-confirm-input-wrapper">
                    <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError(''); // 입력 시 에러 메시지 클리어
                        }}
                        placeholder="현재 비밀번호를 입력하세요"
                        className={`password-confirm-input ${error ? 'error' : ''}`}
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-confirm-toggle-btn"
                        disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {error && <span className="password-confirm-error-message">{error}</span>}
                </div>

                <div className="password-confirm-form-actions">
                  <button
                      type="button"
                      onClick={handleGoBack}
                      className="password-confirm-cancel-button"
                      disabled={isLoading}
                  >
                    취소
                  </button>
                  <button
                      type="submit"
                      className="password-confirm-confirm-button"
                      disabled={isLoading || !password.trim()}
                  >
                    {isLoading ? '확인 중...' : '다음 단계'}
                  </button>
                </div>
              </form>
            </div>

            {/* 도움말 */}
            <div className="password-confirm-help-section">
              <h4>비밀번호를 잊으셨나요?</h4>
              <p>
                비밀번호를 잊으신 경우 로그아웃 후 비밀번호 찾기를 이용해주세요.
                <br />
                또는 고객센터에 문의하시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default PasswordConfirmPage;
