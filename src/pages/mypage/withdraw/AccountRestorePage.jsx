import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Clock, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { useAuth } from '../../../util/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../../styles/MyPage/AccountRestorePage.css';

const AccountRestorePage = () => {
  const navigate = useNavigate();
  const { resetAuth, checkAuth, onTokenRefresh } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [withdrawInfo, setWithdrawInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [hasCheckedStatus, setHasCheckedStatus] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // 탈퇴 상태 정보 조회 함수 (useCallback으로 감싸서 의존성 문제 해결)
  const fetchWithdrawStatus = useCallback(async () => {
    if (hasCheckedStatus) {
      console.log('이미 상태 확인 완료 - 중복 호출 방지');
      return;
    }

    try {
      console.log('탈퇴 상태 조회 시작...');

      const response = await axios.get(`${API_BASE_URL}/api/mypage/withdraw/status`, {
        withCredentials: true
      });

      if (response.status === 200 && response.data.success) {
        const data = response.data.withdrawInfo;
        console.log('탈퇴 상태 조회 결과:', data);

        // 이미 복구된 계정인 경우 (isWithdrawn=false)
        if (data.isWithdrawn === false) {
          console.log('계정이 이미 복구된 상태입니다. 메인 페이지로 리다이렉트');

          await Swal.fire({
            title: '이미 복구된 계정',
            text: '계정이 이미 복구되어 있습니다. 메인 페이지로 이동합니다.',
            icon: 'info',
            confirmButtonColor: '#F76B59',
            confirmButtonText: '확인'
          });

          // 이미 복구된 계정은 완전 새로고침으로 처리
          console.log('이미 복구된 계정 - 페이지 완전 새로고침으로 메인 이동');
          window.location.href = '/main';
          return;
        }

        // 아직 탈퇴 상태인 경우
        setWithdrawInfo(data);
        setHasCheckedStatus(true);

      } else {
        throw new Error('탈퇴 상태 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('탈퇴 상태 조회 오류:', error);

      // 401 에러는 정상적인 상황 (탈퇴한 사용자이므로 토큰이 없음)
      if (error.response?.status === 401) {
        console.log('인증 토큰 없음 - 탈퇴한 사용자로 추정');

        // 기본 복구 정보 설정
        const defaultInfo = {
          isWithdrawn: true,
          withdrawDate: new Date().toISOString(),
          deleteDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3시간 후
          deleteDateFormatted: new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString('ko-KR'),
          daysRemaining: 0
        };

        setWithdrawInfo(defaultInfo);
        setHasCheckedStatus(true);
      } else {
        // 다른 에러의 경우 로그인 페이지로 이동
        console.error('예상치 못한 오류, 로그인 페이지로 이동');
        navigate('/', { replace: true });
      }
    }
  }, [API_BASE_URL, hasCheckedStatus, navigate]);

  // 컴포넌트 마운트 시 한 번만 상태 조회
  useEffect(() => {
    if (!hasCheckedStatus) {
      fetchWithdrawStatus();
    }
  }, [fetchWithdrawStatus, hasCheckedStatus]);

  // 남은 시간 카운트다운
  useEffect(() => {
    if (withdrawInfo?.deleteDate && withdrawInfo?.isWithdrawn) {
      const timer = setInterval(() => {
        const now = new Date();
        const deleteDate = new Date(withdrawInfo.deleteDate);
        const timeDiff = deleteDate - now;

        if (timeDiff <= 0) {
          setTimeRemaining('복구 시간이 만료되었습니다.');
          clearInterval(timer);
        } else {
          const hours = Math.floor(timeDiff / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          setTimeRemaining(`${hours}시간 ${minutes}분 ${seconds}초`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [withdrawInfo]);

  const handleRestore = async () => {
    setIsLoading(true);

    try {
      console.log('계정 복구 요청 시작...');

      const response = await axios.post(`${API_BASE_URL}/api/mypage/restore`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.success) {
        console.log('계정 복구 성공');

        await Swal.fire({
          title: '계정 복구 완료!',
          text: response.data.message,
          icon: 'success',
          confirmButtonColor: '#F76B59',
          confirmButtonText: '확인'
        });

        // 복구 성공 후 새로운 토큰으로 인해 완전 새로고침 필요
        console.log('계정 복구 완료 - 새로운 토큰으로 페이지 완전 새로고침');

        // AuthContext 상태 리셋 후 완전 새로고침
        resetAuth();

        // 잠시 대기 후 메인 페이지로 완전 새로고침
        setTimeout(() => {
          console.log('메인 페이지로 완전 새로고침 이동');
          window.location.href = '/main';
        }, 300);

      } else {
        throw new Error(response.data.error || '계정 복구 중 오류가 발생했습니다.');
      }

    } catch (error) {
      console.error('계정 복구 오류:', error);

      let errorMessage = '계정 복구 중 오류가 발생했습니다.';

      if (error.response?.status === 400) {
        errorMessage = error.response.data.error || '이미 복구된 계정이거나 복구할 수 없는 상태입니다.';
      } else if (error.response?.status === 401) {
        errorMessage = '인증이 만료되었습니다. 다시 로그인해주세요.';
        setTimeout(() => navigate('/', { replace: true }), 2000);
      }

      await Swal.fire({
        title: '복구 실패',
        text: errorMessage,
        icon: 'error',
        confirmButtonColor: '#F76B59',
        confirmButtonText: '확인'
      });

    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSignup = () => {
    resetAuth();
    navigate('/membership');
  };

  const handleLoginPage = () => {
    resetAuth();
    navigate('/');
  };

  // 아직 상태 확인 중이거나 이미 복구된 계정인 경우 로딩 표시
  if (!hasCheckedStatus || (withdrawInfo && !withdrawInfo.isWithdrawn)) {
    return (
        <div className="restore-page-container">
          <div className="restore-page-content">
            <div className="loading-section">
              <div className="loading-spinner"></div>
              <p>계정 상태를 확인하는 중...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="restore-page-container">
        <div className="restore-page-content">
          {/* 헤더 */}
          <div className="restore-header">
            <div className="restore-icon-wrapper">
              <RotateCcw className="restore-main-icon" />
            </div>
            <h1>계정 복구</h1>
            <p className="restore-subtitle">탈퇴한 계정을 복구할 수 있습니다</p>
          </div>

          {/* 복구 시간 표시 */}
          {timeRemaining && (
              <div className="status-section">
                <div className="status-card">
                  <div className="status-header">
                    <Clock className="status-icon" />
                    <h3>복구 가능 시간</h3>
                  </div>
                  <div className="status-content">
                    <div className="status-item">
                      <span className="status-label">남은 시간</span>
                      <span className="status-value highlight">{timeRemaining}</span>
                    </div>
                  </div>
                </div>
              </div>
          )}

          {/* 복구 안내 */}
          <div className="info-section">
            <div className="info-card success">
              <CheckCircle className="info-icon" />
              <div className="info-content">
                <h4>복구 가능</h4>
                <p>3시간 이내에 계정을 복구할 수 있습니다. 복구 시 기존 데이터가 모두 복원됩니다.</p>
              </div>
            </div>

            <div className="info-card warning">
              <Clock className="info-icon" />
              <div className="info-content">
                <h4>시간 제한</h4>
                <p>3시간이 지나면 계정이 완전히 삭제되며, 복구할 수 없습니다.</p>
              </div>
            </div>

            <div className="info-card danger">
              <AlertTriangle className="info-icon" />
              <div className="info-content">
                <h4>주의사항</h4>
                <p>복구 후에는 기존과 동일한 계정으로 서비스를 이용할 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* 복구 절차 */}
          <div className="process-section">
            <h3>복구 절차</h3>
            <div className="process-steps">
              <div className="process-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>계정 복구 신청</h4>
                  <p>아래 '계정 복구' 버튼을 클릭하세요</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>즉시 복구 완료</h4>
                  <p>탈퇴 상태가 해제되고 기존 데이터가 복원됩니다</p>
                </div>
              </div>
              <div className="process-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>서비스 이용 재개</h4>
                  <p>기존과 동일하게 모든 기능을 이용할 수 있습니다</p>
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="action-section">
            <button
                onClick={handleRestore}
                className="restore-button"
                disabled={isLoading}
            >
              {isLoading ? '복구 중...' : '계정 복구'}
            </button>

            <div className="alternative-actions">
              <p>다른 방법으로 진행하시겠습니까?</p>
              <div className="alternative-buttons">
                <button
                    onClick={handleNewSignup}
                    className="signup-button"
                    disabled={isLoading}
                >
                  새 계정 만들기
                </button>
                <button
                    onClick={handleLoginPage}
                    className="login-button"
                    disabled={isLoading}
                >
                  로그인 페이지로
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default AccountRestorePage;
