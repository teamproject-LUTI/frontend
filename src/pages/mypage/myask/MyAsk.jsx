import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  MessageCircle,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import apiClient from '../../../util/apiClient';
import Swal from 'sweetalert2';
import '../../../styles/MyPage/MyAsk.css';

// 더미 데이터
const DUMMY_ASKS = [
  {
    askId: 'dummy1',
    title: '여행 중 숙소 예약 취소 관련 문의',
    content: '안녕하세요. 다음 주에 제주도 여행을 계획하고 있었는데, 갑작스러운 일정 변경으로 인해 예약한 숙소를 취소해야 할 상황이 생겼습니다. 예약 당시 취소 정책을 확인했지만, 구체적인 절차와 환불 일정에 대해 문의드리고 싶습니다. 또한 취소 수수료가 얼마나 발생하는지도 알고 싶습니다.',
    answered: true,
    createdAt: '2024-12-18T14:30:00',
    modifiedAt: '2024-12-18T14:30:00'
  },
  {
    askId: 'dummy2',
    title: '해외 여행 시 항공편 연결 문의',
    content: '다음 달 유럽 여행을 계획 중인데, 인천에서 파리까지 가는 항공편을 예약하려고 합니다. 경유지가 있는 항공편과 직항편 중 어떤 것이 더 좋을지 조언 부탁드립니다. 특히 짐 분실 위험성과 시간 효율성을 고려했을 때 어떤 선택이 더 나은지 궁금합니다.',
    answered: false,
    createdAt: '2024-12-15T09:15:00',
    modifiedAt: '2024-12-15T09:15:00'
  }
];

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

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(9); // 한 페이지에 9개씩

  // 필터링
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest
  const [filterBy, setFilterBy] = useState('all'); // all, answered, pending

  // 더미 데이터 사용 여부 (개발/테스트용)
  const [useDummyData] = useState(true); // 실제 API 연동 시 false로 변경

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

  // 더미 데이터 필터링 및 정렬 함수
  const processDummyData = (data, filterType, sortType) => {
    let filtered = [...data];

    // 필터링
    if (filterType === 'answered') {
      filtered = filtered.filter(ask => ask.answered);
    } else if (filterType === 'pending') {
      filtered = filtered.filter(ask => !ask.answered);
    }

    // 정렬
    switch (sortType) {
      case 'latest':
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default:
        return filtered;
    }
  };

  // 내 QnA 목록 조회
  const fetchMyAsks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (useDummyData) {
        // 더미 데이터 사용
        console.log('더미 데이터 사용 중...', {
          page: currentPage,
          size: pageSize,
          sortBy,
          filterBy
        });

        // 필터링 및 정렬된 더미 데이터
        const processedAsks = processDummyData(DUMMY_ASKS, filterBy, sortBy);

        // 페이지네이션 시뮬레이션
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedAsks = processedAsks.slice(startIndex, endIndex);

        // 통계 계산
        const answeredCount = DUMMY_ASKS.filter(ask => ask.answered).length;
        const pendingCount = DUMMY_ASKS.filter(ask => !ask.answered).length;

        setAsks(paginatedAsks);
        setTotalPages(Math.ceil(processedAsks.length / pageSize));
        setStats({
          totalAsks: DUMMY_ASKS.length,
          answeredAsks: answeredCount,
          pendingAsks: pendingCount
        });

        console.log('더미 데이터 로드 완료:', {
          asks: paginatedAsks,
          stats: { totalAsks: DUMMY_ASKS.length, answeredCount, pendingCount }
        });

        // 로딩 시뮬레이션
        setTimeout(() => {
          setLoading(false);
        }, 500);

        return;
      }

      // 실제 API 호출
      console.log('내 QnA 목록 조회 시작...', {
        page: currentPage,
        size: pageSize,
        sortBy,
        filterBy
      });

      const response = await apiClient.get('/api/mypage/myask', {
        params: {
          page: currentPage - 1, // 백엔드는 0부터 시작
          size: pageSize,
          sortBy: sortBy,
          answered: filterBy === 'all' ? null : filterBy === 'answered'
        }
      });

      if (response.status === 200 && response.data.success) {
        const data = response.data;

        setAsks(data.asks || []);
        setTotalPages(data.totalPages || 1);

        // 통계 정보 업데이트
        setStats({
          totalAsks: data.totalElements || 0,
          answeredAsks: data.answeredAsks || 0,
          pendingAsks: data.pendingAsks || 0
        });

        console.log('내 QnA 목록 조회 성공:', data);
      } else {
        throw new Error(response.data.error || 'QnA 목록을 불러오는데 실패했습니다.');
      }

    } catch (error) {
      console.error('내 QnA 목록 조회 중 오류:', error);

      if (error.response?.status === 401) {
        console.log('인증 오류 - 로그인 페이지로 리다이렉트');
        return;
      }

      setError(error.message || 'QnA 목록을 불러오는데 실패했습니다.');
      setAsks([]);

    } finally {
      if (!useDummyData) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortBy, filterBy, useDummyData]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMyAsks();
  }, [fetchMyAsks]);

  // 정렬 변경 시 첫 페이지로 이동
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  // 필터 변경 시 첫 페이지로 이동
  const handleFilterChange = (newFilterBy) => {
    setFilterBy(newFilterBy);
    setCurrentPage(1);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // QnA 상세 보기
  const handleAskClick = (askId) => {
    if (askId.startsWith('dummy')) {
      // 더미 데이터인 경우 알림 표시
      Swal.fire({
        title: '더미 데이터',
        text: '이것은 테스트용 더미 데이터입니다.',
        icon: 'info',
        confirmButtonColor: '#F76B59'
      });
      return;
    }
    navigate(`/community/qna/${askId}`);
  };

  // QnA 수정
  const handleEditAsk = (e, askId) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    if (askId.startsWith('dummy')) {
      // 더미 데이터인 경우 알림 표시
      Swal.fire({
        title: '더미 데이터',
        text: '더미 데이터는 수정할 수 없습니다.',
        icon: 'info',
        confirmButtonColor: '#F76B59'
      });
      return;
    }
    navigate(`/community/qna/${askId}/edit`);
  };

  // QnA 삭제
  const handleDeleteAsk = async (e, askId, title) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    if (askId.startsWith('dummy')) {
      // 더미 데이터인 경우 알림 표시
      Swal.fire({
        title: '더미 데이터',
        text: '더미 데이터는 삭제할 수 없습니다.',
        icon: 'info',
        confirmButtonColor: '#F76B59'
      });
      return;
    }

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

        if (response.status === 200) {
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

  // 페이지네이션 버튼 생성
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
          <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          >
            {i}
          </button>
      );
    }

    return buttons;
  };

  return (
      <Layout>
        <div className="my-ask-container">
          <div className="my-ask-content">
            {/* 헤더 */}
            <div className="my-ask-header">
              <div className="my-ask-title">
                <HelpCircle className="my-ask-icon" />
                <h1>내가 쓴 QnA</h1>
                {useDummyData && (
                    <span className="dummy-badge">더미 데이터</span>
                )}
              </div>
              <p className="my-ask-subtitle">
                내가 작성한 문의사항을 확인하고 관리할 수 있습니다.
              </p>
            </div>

            {/* 통계 정보 */}
            <div className="my-ask-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.totalAsks}</span>
                <span className="stat-label">총 문의</span>
              </div>
              <div className="stat-item answered">
                <span className="stat-number">{stats.answeredAsks}</span>
                <span className="stat-label">답변 완료</span>
              </div>
              <div className="stat-item pending">
                <span className="stat-number">{stats.pendingAsks}</span>
                <span className="stat-label">답변 대기</span>
              </div>
            </div>

            {/* 필터 및 정렬 */}
            <div className="my-ask-filters">
              <div className="filter-group">
                <label htmlFor="filterBy">필터:</label>
                <select
                    id="filterBy"
                    value={filterBy}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="filter-select"
                >
                  <option value="all">전체</option>
                  <option value="answered">답변 완료</option>
                  <option value="pending">답변 대기</option>
                </select>
              </div>
              <div className="filter-group">
                <label htmlFor="sortBy">정렬:</label>
                <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="filter-select"
                >
                  <option value="latest">최신순</option>
                  <option value="oldest">오래된순</option>
                </select>
              </div>
            </div>

            {/* QnA 리스트 */}
            <div className="my-ask-list">
              {loading ? (
                  <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">문의를 불러오는 중...</p>
                  </div>
              ) : error ? (
                  <div className="error-section">
                    <p className="error-message">⚠️ {error}</p>
                    <button onClick={handleRetry} className="retry-button">
                      다시 시도
                    </button>
                  </div>
              ) : asks.length === 0 ? (
                  <div className="empty-state">
                    <HelpCircle className="empty-icon" />
                    <h3 className="empty-title">작성한 문의가 없습니다</h3>
                    <p className="empty-description">
                      궁금한 점이 있으시면 언제든 문의해주세요!
                    </p>
                    <button
                        onClick={handleWriteAsk}
                        className="write-ask-button"
                    >
                      <Plus size={16} />
                      문의하기
                    </button>
                  </div>
              ) : (
                  <>
                    <div className="ask-grid">
                      {asks.map((ask) => (
                          <div
                              key={ask.askId}
                              className={`ask-card ${ask.askId.startsWith('dummy') ? 'dummy-card' : ''}`}
                              onClick={() => handleAskClick(ask.askId)}
                          >
                            <div className="ask-card-header">
                              <h3 className="ask-title">{ask.title}</h3>
                              <div className="ask-status">
                                {ask.answered ? (
                                    <span className="status-badge answered">
                              <CheckCircle size={12} />
                              답변완료
                            </span>
                                ) : (
                                    <span className="status-badge pending">
                              <Clock size={12} />
                              답변대기
                            </span>
                                )}
                              </div>
                            </div>

                            <p className="ask-content">{ask.content}</p>

                            <div className="ask-date">
                              <Calendar size={14} />
                              <span>{formatDateOnly(ask.createdAt)}</span>
                            </div>

                            <div className="ask-meta">
                              <div className="ask-stats">
                                <div className="stat-badge">
                                  <MessageCircle className="stat-icon" />
                                  <span>{ask.answered ? '답변됨' : '미답변'}</span>
                                </div>
                              </div>

                              <div className="ask-actions">
                                <button
                                    onClick={(e) => handleEditAsk(e, ask.askId)}
                                    className="action-button edit"
                                    title="수정"
                                >
                                  <Edit3 size={12} />
                                  수정
                                </button>
                                <button
                                    onClick={(e) => handleDeleteAsk(e, ask.askId, ask.title)}
                                    className="action-button delete"
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

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="pagination">
                          <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="pagination-button"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {renderPaginationButtons()}

                          <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="pagination-button"
                          >
                            <ChevronRight size={16} />
                          </button>

                          <div className="pagination-info">
                            {currentPage} / {totalPages} 페이지
                          </div>
                        </div>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default MyAsk;
