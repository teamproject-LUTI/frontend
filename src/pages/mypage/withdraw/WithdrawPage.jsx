import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Clock, UserX } from 'lucide-react';
import { useAuth } from '../../../util/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../../styles/MyPage/WithdrawPage.css';

const WithdrawPage = (callback, deps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, resetAuth } = useAuth();

  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // 이전 페이지에서 전달받은 비밀번호 확인 정보
  const confirmedPassword = location.state?.confirmedPassword;
  const isPasswordConfirmed = location.state?.isPasswordConfirmed;

  // 탈퇴 사유 옵션
  const withdrawReasons = [
    '서비스를 더 이상 이용하지 않아서',
    '다른 서비스가 더 좋아서',
    '개인정보가 걱정되어서',
    '사용법이 어려워서',
    '원하는 기능이 없어서',
    '기타'
  ];

  // 소셜 로그인 사용자인지 확인
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isSocialUser = useCallback(() => {
    return user?.provider && user.provider !== 'LOCAL';
  });

  // 페이지 접근 권한 확인
  useEffect(() => {
    // 일반 로그인 사용자인데 비밀번호 확인을 거치지 않은 경우
    if (!isSocialUser() && !isPasswordConfirmed) {
      navigate('/mypage/withdraw/confirm', { replace: true });
    }
  }, [user, isPasswordConfirmed, navigate, isSocialUser]);

  // 탈퇴 처리 함수
  const handleWithdraw = async () => {
    setIsLoading(true);

    try {
      const requestData = {
        password: isSocialUser() ? null : confirmedPassword,
        reason: selectedReason === '기타' ? customReason : selectedReason
      };

      const response = await axios.delete(`${API_BASE_URL}/api/mypage/withdraw`, {
        data: requestData,
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.success) {
        // AuthContext 상태 초기화
        resetAuth();

        // 성공 메시지와 함께 로그인 페이지로 이동
        await Swal.fire({
          title: '회원탈퇴 완료',
          html: `
            <div style="text-align: left; line-height: 1.6;">
              <p style="margin-bottom: 12px;">${response.data.message}</p>
              <div style="background-color: #fef3cd; padding: 12px; border-radius: 6px; border-left: 4px solid #fbbf24;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>복구 안내:</strong><br>
                  3시간 이내에 다시 로그인하시면 계정을 복구할 수 있습니다.
                </p>
              </div>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#F76B59',
          confirmButtonText: '확인',
          allowOutsideClick: false
        });

        // 로그인 페이지로 이동
        navigate('/', { replace: true });

      } else {
        throw new Error(response.data.error || '회원탈퇴 처리 중 오류가 발생했습니다.');
      }

    } catch (error) {
      console.error('회원탈퇴 오류:', error);

      let errorMessage = '회원탈퇴 처리 중 오류가 발생했습니다.';

      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || '잘못된 요청입니다.';
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }

      await Swal.fire({
        title: '탈퇴 실패',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#F76B59',
        confirmButtonText: '확인'
      });

    } finally {
      setIsLoading(false);
    }
  };

  // 탈퇴 버튼 클릭 처리
  const handleWithdrawClick = () => {
    if (!agreementChecked) {
      Swal.fire({
        title: '약관 동의 필요',
        text: '탈퇴 안내사항에 동의해주세요.',
        icon: 'warning',
        confirmButtonColor: '#F76B59',
        confirmButtonText: '확인'
      });
      return;
    }

    // 최종 확인 후 탈퇴 처리
    Swal.fire({
      title: '정말 탈퇴하시겠습니까?',
      text: '탈퇴 후 3시간 이내 재로그인 시 계정을 복구할 수 있습니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d3d3d3',
      confirmButtonText: '탈퇴하기',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        handleWithdraw();
      }
    });
  };

  // 뒤로 가기
  const handleGoBack = () => {
    if (isSocialUser()) {
      // 소셜 로그인 사용자는 마이페이지로
      navigate('/mypage');
    } else {
      // 일반 로그인 사용자는 비밀번호 확인 페이지로
      navigate('/mypage/withdraw/confirm');
    }
  };

  return (
        <div className="withdraw-container">
          <div className="withdraw-content">
            {/* 헤더 */}
            <div className="withdraw-header">
              <button onClick={handleGoBack} className="withdraw-back-button">
                <ArrowLeft size={20}/>
                <span>돌아가기</span>
              </button>
              <div className="withdraw-title">
                <UserX className="withdraw-icon"/>
                <h1>회원탈퇴</h1>
              </div>
            </div>

            {/* 경고 메시지 */}
            <div className="withdraw-warning-section">
              <AlertTriangle className="withdraw-warning-icon"/>
              <div className="withdraw-warning-content">
                <h3>탈퇴 전 꼭 확인해주세요!</h3>
                <ul className="withdraw-warning-list">
                  <li>탈퇴 시 계정 정보와 이용 기록이 삭제됩니다.</li>
                  <li>삭제된 데이터는 복구할 수 없습니다.</li>
                  <li>3시간 이내 재로그인 시 계정 복구가 가능합니다.</li>
                  <li>3시간 후에는 모든 정보가 완전히 삭제됩니다.</li>
                </ul>
              </div>
            </div>

            {/* 탈퇴 사유 선택 */}
            <div className="withdraw-reason-section">
              <h3>탈퇴 사유를 선택해주세요 (선택사항)</h3>
              <div className="withdraw-reason-options">
                {withdrawReasons.map((reason, index) => (
                    <label key={index} className="withdraw-reason-option">
                      <input
                          type="radio"
                          name="withdrawReason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          disabled={isLoading}
                      />
                      <span className="withdraw-reason-text">{reason}</span>
                    </label>
                ))}
              </div>

              {/* 기타 사유 입력 */}
              {selectedReason === '기타' && (
                  <div className="withdraw-custom-reason">
                <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="탈퇴 사유를 입력해주세요"
                    className="withdraw-custom-reason-input"
                    rows={3}
                    disabled={isLoading}
                />
                  </div>
              )}
            </div>

            {/* 복구 안내 */}
            <div className="withdraw-restore-info">
              <Clock className="withdraw-restore-icon"/>
              <div className="withdraw-restore-content">
                <h4>계정 복구 안내</h4>
                <p>
                  탈퇴 후 <strong>3시간 이내</strong>에 다시 로그인하시면
                  계정을 복구할 수 있습니다. 3시간이 지나면 모든 정보가
                  완전히 삭제되며 복구가 불가능합니다.
                </p>
              </div>
            </div>

            {/* 동의 체크박스 */}
            <div className="withdraw-agreement-section">
              <label className="withdraw-agreement-checkbox">
                <input
                    type="checkbox"
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    disabled={isLoading}
                />
                <span className="withdraw-agreement-text">
                위 안내사항을 모두 확인했으며, 회원탈퇴에 동의합니다.
              </span>
              </label>
            </div>

            {/* 탈퇴 버튼 */}
            <div className="withdraw-actions">
              <button
                  onClick={handleGoBack}
                  className="withdraw-cancel-button"
                  disabled={isLoading}
              >
                취소
              </button>
              <button
                  onClick={handleWithdrawClick}
                  className="withdraw-button"
                  disabled={isLoading || !agreementChecked}
              >
                {isLoading ? '처리 중...' : '회원탈퇴'}
              </button>
            </div>
          </div>
        </div>
  );
};
export default WithdrawPage;
