import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Clock, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { useAuth } from '../../../util/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../../styles/MyPage/AccountRestorePage.css';

const AccountRestorePage = () => {
  const navigate = useNavigate();
  const { resetAuth } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [withdrawInfo, setWithdrawInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // 탈퇴 상태 정보 조회 함수 (먼저 정의)
  const fetchWithdrawStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/mypage/withdraw/status`, {
        withCredentials: true
      });

      if (response.status === 200 && response.data.success) {
        setWithdrawInfo(response.data.withdrawInfo);
      }
    } catch (error) {
      console.error('탈퇴 상태 조회 오류:', error);

      // 401 에러는 정상적인 상황 (탈퇴한 사용자이므로 토큰이 없음)
      if (error.response?.status === 401) {
        console.log('인증 토큰 없음 - 탈퇴한 사용자로 추정');
        // 기본 복구 정보 설정
        setWithdrawInfo({
          isWithdrawn: true,
          withdrawDate: new Date().toISOString(),
          deleteDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3시간 후
          deleteDateFormatted: new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString('ko-KR'),
          daysRemaining: 0
        });
      }
    }
  };

  // 탈퇴 상태 정보 조회
  useEffect(() => {
    fetchWithdrawStatus();
  }, []);

  // 남은 시간 카운트다운
  useEffect(() => {
    if (withdrawInfo?.deleteDate) {
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
      const response = await axios.post(`${API_BASE_URL}/api/mypage/restore`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 && response.data.success) {
        await Swal.fire({
          title: '계정 복구 완료!',
          text: response.data.message,
          icon: 'success',
          confirmButtonColor: '#F76B59',
          confirmButtonText: '확인'
        });

        // 메인 페이지로 이동
        navigate('/main', { replace: true });
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
          </div>
        </div>
      </div>
  );
};

export default AccountRestorePage;
