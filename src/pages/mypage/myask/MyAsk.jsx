import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  MessageCircle,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  CheckCircle,
  Clock
} from 'lucide-react';
import apiClient from '../../../util/apiClient';
import Swal from 'sweetalert2';
import Pagination from '../../../components/common/Pagination';
import '../../../styles/MyPage/MyAsk.css';

const MyAsk = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [asks, setAsks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAsks: 0,
    answeredAsks: 0,
    pendingAsks: 0
  });

  // 페이지네이션 (백엔드 기반 - 0부터 시작)
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(9); // 한 페이지에 9개씩

  // 필터링 및 정렬
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest
  const [answerStatus, setAnswerStatus] = useState('all'); // all, answered, unanswered

  // 날짜 포맷팅 함수 (날짜만 표시)
  const formatDateOnly = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 내 QnA 목록 조회 (백엔드 API 호출)
  const fetchMyAsks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('내 QnA 목록 조회 시작...', {
        page: currentPage,
        size: pageSize,
        sortBy,
        answerStatus
      });

      const response = await apiClient.get('/api/asks/my', {
        params: {
          page: currentPage, // 백엔드는 0부터 시작
          size: pageSize,
          sortBy: sortBy,
          answerStatus: answerStatus
        }
      });

      if (response.status === 200) {
        const data = response.data;

        console.log('API 응답 데이터:', data);

        // asks 데이터 설정
        setAsks(data.data || []);

        // 페이지네이션 정보 설정
        if (data.pageInfo) {
          setTotalPages(data.pageInfo.totalPages || 0);
          setTotalElements(data.pageInfo.totalElements || 0);

          // 통계 정보 계산
          setStats({
            totalAsks: data.pageInfo.totalElements || 0,
            answeredAsks: data.data ? data.data.filter(ask => ask.answered).length : 0,
            pendingAsks: data.data ? data.data.filter(ask => !ask.answered).length : 0
          });
        }

        console.log('내 QnA 목록 조회 성공:', {
          totalAsks: data.pageInfo?.totalElements,
          currentPage: currentPage,
          totalPages: data.pageInfo?.totalPages
        });
      } else {
        throw new Error('QnA 목록을 불러오는데 실패했습니다.');
      }

    } catch (error) {
      console.error('내 QnA 목록 조회 중 오류:', error);

      if (error.response?.status === 401) {
        console.log('인증 오류 - 로그인 페이지로 리다이렉트');
        navigate('/', { replace: true });
        return;
      }

      setError(error.response?.data?.message || error.message || 'QnA 목록을 불러오는데 실패했습니다.');
      setAsks([]);
      setStats({ totalAsks: 0, answeredAsks: 0, pendingAsks: 0 });

    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, answerStatus, navigate]);

  // 컴포넌트 마운트 시 및 의존성 변경 시 데이터 로드
  useEffect(() => {
    fetchMyAsks();
  }, [fetchMyAsks]);

  // 정렬 변경 시 첫 페이지로 이동
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(0); // 첫 페이지로 리셋
  };

  // 필터 변경 시 첫 페이지로 이동
  const handleAnswerStatusChange = (newAnswerStatus) => {
    setAnswerStatus(newAnswerStatus);
    setCurrentPage(0); // 첫 페이지로 리셋
  };

  // 페이지네이션 버튼 생성 (공통 컴포넌트로 교체)
  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // QnA 상세 보기
  const handleAskClick = (askId) => {
    navigate(`/community/qna/${askId}`);
  };

  // QnA 수정
  const handleEditAsk = (e, askId) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    navigate(`/community/qna/edit/${askId}`);
  };

  // QnA 삭제
  const handleDeleteAsk = async (e, askId, title) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    const result = await Swal.fire({
      title: 'QnA 삭제',
      html: `
        <p style="margin-bottom: 10px;">정말로 이 문의를 삭제하시겠습니까?</p>
        <p style="font-weight: bold; color: #374151;">"${title}"</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/api/asks/${askId}`);

        if (response.status === 204) {
          await Swal.fire({
            title: '삭제 완료!',
            text: '문의가 성공적으로 삭제되었습니다.',
            icon: 'success',
            confirmButtonColor: '#F76B59'
          });

          // 목록 새로고침
          fetchMyAsks();
        } else {
          throw new Error('문의 삭제에 실패했습니다.');
        }

      } catch (error) {
        console.error('QnA 삭제 중 오류:', error);

        await Swal.fire({
          title: '삭제 실패',
          text: error.response?.data?.error || '문의 삭제 중 오류가 발생했습니다.',
          icon: 'error',
          confirmButtonColor: '#F76B59'
        });
      }
    }
  };

  // 새 문의 작성
  const handleWriteAsk = () => {
    navigate('/community/qna/write');
  };

  // 재시도
  const handleRetry = () => {
    setError(null);
    fetchMyAsks();
  };

  const cleanContent = (content) => {
    if (!content) return '';

    // HTML 태그 제거
    const withoutTags = content.replace(/<[^>]*>/g, '');

    // 연속된 공백 정리
    const cleaned = withoutTags.replace(/\s+/g, ' ').trim();

    // 내용이 너무 길면 자르기 (선택사항)
    return cleaned.length > 100 ? cleaned.substring(0, 100) + '...' : cleaned;
  };
  return (
      <div className="myask-container">
        <div className="myask-content">
          {/* 헤더 */}
          <div className="myask-header">
            <div className="myask-title">
              <HelpCircle className="myask-icon" />
              <h1>내가 쓴 QnA</h1>
            </div>
            <p className="myask-subtitle">
              내가 작성한 문의사항을 확인하고 관리할 수 있습니다.
            </p>
          </div>

          {/* 통계 정보 */}
          <div className="myask-stats">
            <div className="myask-stat-item">
              <span className="myask-stat-number">{stats.totalAsks}</span>
              <span className="myask-stat-label">총 문의</span>
            </div>
            <div className="myask-stat-item answered">
              <span className="myask-stat-number">{stats.answeredAsks}</span>
              <span className="myask-stat-label">답변 완료</span>
            </div>
            <div className="myask-stat-item pending">
              <span className="myask-stat-number">{stats.pendingAsks}</span>
              <span className="myask-stat-label">답변 대기</span>
            </div>
          </div>

          {/* 필터 및 정렬 */}
          <div className="myask-filters">
            <div className="myask-filter-group">
              <label htmlFor="answerStatus">필터:</label>
              <select
                  id="answerStatus"
                  value={answerStatus}
                  onChange={(e) => handleAnswerStatusChange(e.target.value)}
                  className="myask-filter-select"
              >
                <option value="all">전체</option>
                <option value="answered">답변 완료</option>
                <option value="unanswered">답변 대기</option>
              </select>
            </div>
            <div className="myask-filter-group">
              <label htmlFor="sortBy">정렬:</label>
              <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="myask-filter-select"
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
              </select>
            </div>
          </div>

          {/* QnA 리스트 */}
          <div className="myask-list">
            {loading ? (
                <div className="myask-loading-section">
                  <div className="myask-loading-spinner"></div>
                  <p className="myask-loading-text">문의를 불러오는 중...</p>
                </div>
            ) : error ? (
                <div className="myask-error-section">
                  <p className="myask-error-message">⚠️ {error}</p>
                  <button onClick={handleRetry} className="myask-retry-button">
                    다시 시도
                  </button>
                </div>
            ) : asks.length === 0 ? (
                <div className="myask-empty-state">
                  <HelpCircle className="myask-empty-icon" />
                  <h3 className="myask-empty-title">작성한 문의가 없습니다</h3>
                  <p className="myask-empty-description">
                    궁금한 점이 있으시면 언제든 문의해주세요!
                  </p>
                  <button
                      onClick={handleWriteAsk}
                      className="myask-write-button"
                  >
                    <Plus size={16} />
                    문의하기
                  </button>
                </div>
            ) : (
                <>
                  <div className="myask-grid">
                    {asks.map((ask) => (
                        <div
                            key={ask.askId}
                            className="myask-card"
                            onClick={() => handleAskClick(ask.askId)}
                        >
                          <div className="myask-card-header">
                            <h3 className="myask-card-title">{ask.title}</h3>
                            <div className="myask-status">
                              {ask.answered ? (
                                  <span className="myask-status-badge answered">
                            <CheckCircle size={12} />
                            답변완료
                          </span>
                              ) : (
                                  <span className="myask-status-badge pending">
                            <Clock size={12} />
                            답변대기
                          </span>
                              )}
                            </div>
                          </div>

                          <p className="myask-card-content">{cleanContent(ask.content)}</p>

                          <div className="myask-date">
                            <Calendar size={14} />
                            <span>{formatDateOnly(ask.createdAt)}</span>
                          </div>

                          <div className="myask-meta">
                            {/*<div className="myask-card-stats">*/}
                            {/*  <div className="myask-stat-badge">*/}
                            {/*    <MessageCircle className="myask-stat-icon" />*/}
                            {/*    <span>{ask.answered ? '답변됨' : '미답변'}</span>*/}
                            {/*  </div>*/}
                            {/*</div>*/}

                            <div className="myask-actions">
                              <button
                                  onClick={(e) => handleEditAsk(e, ask.askId)}
                                  className="myask-action-button edit"
                                  title="수정"
                              >
                                <Edit3 size={12} />
                                수정
                              </button>
                              <button
                                  onClick={(e) => handleDeleteAsk(e, ask.askId, ask.title)}
                                  className="myask-action-button delete"
                                  title="삭제"
                              >
                                <Trash2 size={12} />
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                  </div>

                  {/* 페이지네이션 - 공통 컴포넌트 사용 */}
                  {totalPages > 1 && (
                      <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalElements={totalElements}
                          pageSize={pageSize}
                          onPageChange={handlePageChange}
                          showInfo={true}
                          maxVisiblePages={5}
                      />
                  )}
                </>
            )}
          </div>
        </div>
      </div>
  );
};

export default MyAsk;
