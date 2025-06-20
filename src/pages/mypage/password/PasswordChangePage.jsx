import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowLeft, Shield, AlertTriangle} from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { useAuth } from '../../../util/AuthContext';
import apiClient from '../../../util/apiClient';
import Swal from 'sweetalert2';
import '../../../styles/MyPage/PasswordChangePage.css';
/* eslint-disable */
const PasswordChangePage = () => {
  const navigate = useNavigate();
  const { user, resetAuth } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordPolicyChecks, setPasswordPolicyChecks] = useState({
    length: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });

  // 소셜 로그인 사용자 체크
  const isSocialUser = () => {
    return user?.provider && user.provider !== 'LOCAL';
  };

  // 소셜 로그인 사용자는 접근 차단
  useEffect(() => {
    if (user && isSocialUser()) {
      // 소셜 로그인 사용자는 접근할 수 없음을 알림
      setTimeout(() => {
        Swal.fire({
          title: '접근 제한',
          text: '소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.',
          icon: 'warning',
          confirmButtonColor: '#F76B59',
          confirmButtonText: '확인'
        }).then(() => {
          navigate('/mypage');
        });
      }, 100);
    }
  }, [user, navigate]);

  // 입력값 변경 핸들러
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 에러 메시지 클리어
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // 새 비밀번호 강도 체크
    if (field === 'newPassword') {
      checkPasswordStrength(value);
      checkPasswordPolicy(value);
    }

    // 비밀번호 확인 일치 체크
    if (field === 'confirmPassword' || (field === 'newPassword' && formData.confirmPassword)) {
      const newPassword = field === 'newPassword' ? value : formData.newPassword;
      const confirmPassword = field === 'confirmPassword' ? value : formData.confirmPassword;

      if (confirmPassword && newPassword !== confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: '새 비밀번호와 일치하지 않습니다.'
        }));
      } else if (confirmPassword && newPassword === confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  // 비밀번호 강도 체크
  const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  };

  // 비밀번호 정책 체크
  const checkPasswordPolicy = (password) => {
    setPasswordPolicyChecks({
      length: password.length >= 8 && password.length <= 20,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^a-zA-Z0-9]/.test(password)
    });
  };

  // 비밀번호 표시/숨김 토글
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // 폼 유효성 검증
  const validateForm = () => {
    const newErrors = {};

    // 현재 비밀번호 체크
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = '현재 비밀번호를 입력해주세요.';
    }

    // 새 비밀번호 체크
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = '새 비밀번호를 입력해주세요.';
    } else if (formData.newPassword.length < 8 || formData.newPassword.length > 20) {
      newErrors.newPassword = '비밀번호는 8~20자로 입력해주세요.';
    }

    // 비밀번호 확인 체크
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = '새 비밀번호 확인을 입력해주세요.';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = '새 비밀번호와 일치하지 않습니다.';
    }

    // 현재 비밀번호와 새 비밀번호 같음 체크
    if (formData.currentPassword && formData.newPassword &&
        formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = '새 비밀번호는 현재 비밀번호와 달라야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 비밀번호 변경 처리
  const handleSubmit = async () => {
    // 유효성 검증
    if (!validateForm()) {
      return;
    }

    // 최종 확인
    const result = await Swal.fire({
      title: '비밀번호 변경',
      text: '비밀번호를 변경하시겠습니까? 변경 후 다시 로그인해야 합니다.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '변경',
      cancelButtonText: '취소'
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsLoading(true);

    try {
      console.log('비밀번호 변경 요청...');

      const response = await apiClient.post('/api/mypage/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.status === 200 && response.data.success) {
        console.log('비밀번호 변경 성공');

        // AuthContext 상태 초기화
        resetAuth();

        // 성공 메시지와 함께 로그인 페이지로 이동
        await Swal.fire({
          title: '비밀번호 변경 완료!',
          text: response.data.message || '비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.',
          icon: 'success',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: '로그인 페이지로',
          allowOutsideClick: false
        });

        // 로그인 페이지로 이동
        navigate('/', { replace: true });

      } else {
        throw new Error(response.data.error || '비밀번호 변경에 실패했습니다.');
      }

    } catch (error) {
      console.error('비밀번호 변경 오류:', error);

      let errorMessage = '비밀번호 변경 중 오류가 발생했습니다.';

      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || '입력 정보를 확인해주세요.';

        // 현재 비밀번호 불일치 에러 처리
        if (errorMessage.includes('현재 비밀번호')) {
          setErrors({ currentPassword: errorMessage });
        }
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }

      await Swal.fire({
        title: '변경 실패',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: '확인'
      });

    } finally {
      setIsLoading(false);
    }
  };

  // 뒤로 가기
  const handleGoBack = () => {
    navigate('/mypage');
  };

  // 비밀번호 강도 텍스트
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
      case 2:
        return '약함';
      case 3:
      case 4:
        return '보통';
      case 5:
        return '강함';
      default:
        return '';
    }
  };

  // 비밀번호 강도 클래스
  const getPasswordStrengthClass = () => {
    if (passwordStrength <= 2) return 'weak';
    if (passwordStrength <= 4) return 'medium';
    return 'strong';
  };

  // 소셜 로그인 사용자인 경우 차단 메시지 표시
  if (user && isSocialUser()) {
    return (
        <Layout>
          <div className="password-change-container">
            <div className="password-change-content">
              <div className="social-user-blocked">
                <h3>비밀번호 변경 불가</h3>
                <p>소셜 로그인으로 가입한 계정은 비밀번호를 변경할 수 없습니다.</p>
              </div>
            </div>
          </div>
        </Layout>
    );
  }

  return (
      <Layout>
        <div className="password-change-container">
          <div className="password-change-content">
            {/* 헤더 */}
            <div className="password-change-header">
              <button onClick={handleGoBack} className="password-change-back-button">
                <ArrowLeft size={20} />
                <span>돌아가기</span>
              </button>
              <div className="password-change-title">
                <Lock className="password-change-icon" />
                <h1>비밀번호 변경</h1>
              </div>
              <p className="password-change-subtitle">
                보안을 위해 정기적으로 비밀번호를 변경해주세요.
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="password-change-info-section">
              <Shield className="password-change-info-icon" />
              <div className="password-change-info-content">
                <h3>비밀번호 변경 안내</h3>
                <p>비밀번호 변경 후 보안을 위해 모든 기기에서 자동 로그아웃됩니다.</p>
              </div>
            </div>

            {/* 경고 메시지 */}
            <div className="password-change-warning-section">
              <AlertTriangle className="password-change-warning-icon" />
              <div className="password-change-warning-content">
                <p>비밀번호 변경 완료 후 즉시 다시 로그인해야 합니다.</p>
              </div>
            </div>

            {/* 비밀번호 변경 폼 */}
            <div className="password-change-form-section">
              {/* 현재 비밀번호 */}
              <div className="password-change-form-group">
                <label htmlFor="currentPassword" className="password-change-label">
                  현재 비밀번호
                </label>
                <div className="password-change-input-wrapper">
                  <input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="현재 비밀번호를 입력하세요"
                      className={`password-change-input ${errors.currentPassword ? 'error' : ''}`}
                      disabled={isLoading}
                  />
                  <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="password-change-toggle-btn"
                      disabled={isLoading}
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.currentPassword && (
                    <span className="password-change-error-message">{errors.currentPassword}</span>
                )}
              </div>

              {/* 새 비밀번호 */}
              <div className="password-change-form-group">
                <label htmlFor="newPassword" className="password-change-label">
                  새 비밀번호
                </label>
                <div className="password-change-input-wrapper">
                  <input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      placeholder="새 비밀번호를 입력하세요"
                      className={`password-change-input ${errors.newPassword ? 'error' : ''}`}
                      disabled={isLoading}
                  />
                  <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="password-change-toggle-btn"
                      disabled={isLoading}
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.newPassword && (
                    <span className="password-change-error-message">{errors.newPassword}</span>
                )}

                {/* 비밀번호 강도 표시 */}
                {formData.newPassword && (
                    <div className="password-strength">
                      <div className="password-strength-label">
                        비밀번호 강도: {getPasswordStrengthText()}
                      </div>
                      <div className="password-strength-bar">
                        <div
                            className={`password-strength-fill ${getPasswordStrengthClass()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                )}

                {/* 비밀번호 정책 안내 */}
                <div className="password-policy">
                  <h4>비밀번호 요구사항</h4>
                  <ul className="password-policy-list">
                    <li className={passwordPolicyChecks.length ? 'valid' : ''}>
                      8~20자 길이
                    </li>
                  </ul>
                </div>
              </div>

              {/* 새 비밀번호 확인 */}
              <div className="password-change-form-group">
                <label htmlFor="confirmPassword" className="password-change-label">
                  새 비밀번호 확인
                </label>
                <div className="password-change-input-wrapper">
                  <input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="새 비밀번호를 다시 입력하세요"
                      className={`password-change-input ${
                          errors.confirmPassword ? 'error' :
                              (formData.confirmPassword && formData.newPassword === formData.confirmPassword ? 'success' : '')
                      }`}
                      disabled={isLoading}
                  />
                  <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="password-change-toggle-btn"
                      disabled={isLoading}
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                    <span className="password-change-error-message">{errors.confirmPassword}</span>
                )}
                {formData.confirmPassword && formData.newPassword === formData.confirmPassword && !errors.confirmPassword && (
                    <span className="password-change-success-message">새 비밀번호가 일치합니다.</span>
                )}
              </div>

              {/* 액션 버튼 */}
              <div className="password-change-form-actions">
                <button
                    type="button"
                    onClick={handleGoBack}
                    className="password-change-cancel-button"
                    disabled={isLoading}
                >
                  취소
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="password-change-save-button"
                    disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword || errors.currentPassword || errors.newPassword || errors.confirmPassword}
                >
                  {isLoading ? '변경 중...' : '비밀번호 변경'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default PasswordChangePage;
