import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Eye,
  Heart,
  MapPin,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import apiClient from '../../../util/apiClient';
import Swal from 'sweetalert2';
import '../../../styles/MyPage/MyReview.css';

// 더미 데이터
const DUMMY_REVIEWS = [
  {
    reviewId: 'dummy1',
    title: '제주도 3박 4일 힐링 여행 후기',
    content: '제주도의 아름다운 자연과 맛있는 음식들을 만끽할 수 있었던 최고의 여행이었습니다. 특히 성산일출봉에서 본 일출은 정말 잊을 수 없는 추억이 되었어요. 흑돼지 맛집에서 먹은 고기도 정말 맛있었고, 카페 거리에서 마신 커피도 향이 좋았습니다. 다음에도 꼭 다시 가고 싶은 곳입니다.',
    travelRegion: '제주도',
    travelPeriod: '2024.12.15 - 2024.12.18',
    createdAt: '2024-12-20T10:30:00',
    viewCount: 156,
    likeCount: 23
  },
  {
    reviewId: 'dummy2',
    title: '부산 바다 여행 - 감천문화마을과 해운대',
    content: '부산의 대표적인 관광지들을 둘러본 2박 3일 여행기입니다. 감천문화마을의 알록달록한 집들이 정말 예뻤고, 해운대 해수욕장에서 본 일몰도 환상적이었어요. 자갈치시장에서 먹은 회는 정말 신선하고 맛있었습니다. 또한 부산의 야경도 정말 아름다워서 많은 사진을 찍었습니다.',
    travelRegion: '부산',
    travelPeriod: '2024.11.08 - 2024.11.10',
    createdAt: '2024-11-12T15:45:00',
    viewCount: 89,
    likeCount: 12
  }
];

const MyReview = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalReviews: 0,
    totalViews: 0,
    totalLikes: 0
  });

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(9); // 한 페이지에 9개씩

  // 필터링
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest, views, likes

  // 더미 데이터 사용 여부 (개발/테스트용)
  const [useDummyData] = useState(true); // 실제 API 연동 시 false로 변경

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return '오늘';
    } else if (diffDays === 2) {
      return '어제';
    } else if (diffDays <= 7) {
      return `${diffDays - 1}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // 더미 데이터 정렬 함수
  const sortDummyData = (data, sortType) => {
    const sorted = [...data];
    switch (sortType) {
      case 'latest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'views':
        return sorted.sort((a, b) => b.viewCount - a.viewCount);
      case 'likes':
        return sorted.sort((a, b) => b.likeCount - a.likeCount);
      default:
        return sorted;
    }
  };

  // 내 리뷰 목록 조회
  const fetchMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (useDummyData) {
        // 더미 데이터 사용
        console.log('더미 데이터 사용 중...', {
          page: currentPage,
          size: pageSize,
          sortBy
        });

        // 정렬된 더미 데이터
        const sortedReviews = sortDummyData(DUMMY_REVIEWS, sortBy);

        // 페이지네이션 시뮬레이션
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedReviews = sortedReviews.slice(startIndex, endIndex);

        // 통계 계산
        const totalViews = DUMMY_REVIEWS.reduce((sum, review) => sum + review.viewCount, 0);
        const totalLikes = DUMMY_REVIEWS.reduce((sum, review) => sum + review.likeCount, 0);

        setReviews(paginatedReviews);
        setTotalPages(Math.ceil(DUMMY_REVIEWS.length / pageSize));
        setStats({
          totalReviews: DUMMY_REVIEWS.length,
          totalViews: totalViews,
          totalLikes: totalLikes
        });

        console.log('더미 데이터 로드 완료:', {
          reviews: paginatedReviews,
          stats: { totalReviews: DUMMY_REVIEWS.length, totalViews, totalLikes }
        });

        // 로딩 시뮬레이션
        setTimeout(() => {
          setLoading(false);
        }, 500);

        return;
      }

      // 실제 API 호출
      console.log('내 리뷰 목록 조회 시작...', {
        page: currentPage,
        size: pageSize,
        sortBy
      });

      const response = await apiClient.get('/api/mypage/myreview', {
        params: {
          page: currentPage - 1, // 백엔드는 0부터 시작
          size: pageSize,
          sortBy: sortBy
        }
      });

      if (response.status === 200 && response.data.success) {
        const data = response.data;

        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);

        // 통계 정보 업데이트
        setStats({
          totalReviews: data.totalElements || 0,
          totalViews: data.totalViews || 0,
          totalLikes: data.totalLikes || 0
        });

        console.log('내 리뷰 목록 조회 성공:', data);
      } else {
        throw new Error(response.data.error || '리뷰 목록을 불러오는데 실패했습니다.');
      }

    } catch (error) {
      console.error('내 리뷰 목록 조회 중 오류:', error);

      if (error.response?.status === 401) {
        console.log('인증 오류 - 로그인 페이지로 리다이렉트');
        return;
      }

      setError(error.message || '리뷰 목록을 불러오는데 실패했습니다.');
      setReviews([]);

    } finally {
      if (!useDummyData) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortBy, useDummyData]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  // 정렬 변경 시 첫 페이지로 이동
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 리뷰 상세 보기
  const handleReviewClick = (reviewId) => {
    if (reviewId.startsWith('dummy')) {
      // 더미 데이터인 경우 알림 표시
      Swal.fire({
        title: '더미 데이터',
        text: '이것은 테스트용 더미 데이터입니다.',
        icon: 'info',
        confirmButtonColor: '#F76B59'
      });
      return;
    }
    navigate(`/community/review/${reviewId}`);
  };

  // 리뷰 수정
  const handleEditReview = (e, reviewId) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    if (reviewId.startsWith('dummy')) {
      // 더미 데이터인 경우 알림 표시
      Swal.fire({
        title: '더미 데이터',
        text: '더미 데이터는 수정할 수 없습니다.',
        icon: 'info',
        confirmButtonColor: '#F76B59'
      });
      return;
    }
    navigate(`/community/review/${reviewId}/edit`);
  };

  // 리뷰 삭제
  const handleDeleteReview = async (e, reviewId, title) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    if (reviewId.startsWith('dummy')) {
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
      title: '리뷰 삭제',
      html: `
                <p style="margin-bottom: 10px;">정말로 이 리뷰를 삭제하시겠습니까?</p>
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
        const response = await apiClient.delete(`/api/reviews/${reviewId}`);

        if (response.status === 200) {
          await Swal.fire({
            title: '삭제 완료!',
            text: '리뷰가 성공적으로 삭제되었습니다.',
            icon: 'success',
            confirmButtonColor: '#F76B59'
          });

          // 목록 새로고침
          fetchMyReviews();
        } else {
          throw new Error('리뷰 삭제에 실패했습니다.');
        }

      } catch (error) {
        console.error('리뷰 삭제 중 오류:', error);

        await Swal.fire({
          title: '삭제 실패',
          text: error.response?.data?.error || '리뷰 삭제 중 오류가 발생했습니다.',
          icon: 'error',
          confirmButtonColor: '#F76B59'
        });
      }
    }
  };

  // 새 리뷰 작성
  const handleWriteReview = () => {
    navigate('/community/review/write');
  };

  // 재시도
  const handleRetry = () => {
    setError(null);
    fetchMyReviews();
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
        <div className="my-review-container">
          <div className="my-review-content">
            {/* 헤더 */}
            <div className="my-review-header">
              <div className="my-review-title">
                <MessageSquare className="my-review-icon" />
                <h1>내가 쓴 리뷰</h1>
                {useDummyData && (
                    <span className="dummy-badge">더미 데이터</span>
                )}
              </div>
              <p className="my-review-subtitle">
                내가 작성한 여행 후기를 확인하고 관리할 수 있습니다.
              </p>
            </div>

            {/* 통계 정보 */}
            <div className="my-review-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.totalReviews}</span>
                <span className="stat-label">총 리뷰</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalViews.toLocaleString()}</span>
                <span className="stat-label">총 조회수</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalLikes}</span>
                <span className="stat-label">총 좋아요</span>
              </div>
            </div>

            {/* 필터 및 정렬 */}
            <div className="my-review-filters">
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
                  <option value="views">조회수순</option>
                  <option value="likes">좋아요순</option>
                </select>
              </div>
            </div>

            {/* 리뷰 리스트 */}
            <div className="my-review-list">
              {loading ? (
                  <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">리뷰를 불러오는 중...</p>
                  </div>
              ) : error ? (
                  <div className="error-section">
                    <p className="error-message">⚠️ {error}</p>
                    <button onClick={handleRetry} className="retry-button">
                      다시 시도
                    </button>
                  </div>
              ) : reviews.length === 0 ? (
                  <div className="empty-state">
                    <MessageSquare className="empty-icon" />
                    <h3 className="empty-title">작성한 리뷰가 없습니다</h3>
                    <p className="empty-description">
                      첫 번째 여행 후기를 작성해보세요!
                    </p>
                    <button
                        onClick={handleWriteReview}
                        className="write-review-button"
                    >
                      <Plus size={16} />
                      리뷰 작성하기
                    </button>
                  </div>
              ) : (
                  <>
                    <div className="review-grid">
                      {reviews.map((review) => (
                          <div
                              key={review.reviewId}
                              className={`review-card ${review.reviewId.startsWith('dummy') ? 'dummy-card' : ''}`}
                              onClick={() => handleReviewClick(review.reviewId)}
                          >
                            <div className="review-card-header">
                              <h3 className="review-title">{review.title}</h3>
                              <span className="review-date">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>

                            {review.travelRegion && (
                                <div className="review-region">
                                  <MapPin size={14} />
                                  {review.travelRegion}
                                </div>
                            )}

                            <p className="review-content">{review.content}</p>

                            {review.travelPeriod && (
                                <div className="review-period">
                                  <Calendar size={14} />
                                  <span>{review.travelPeriod}</span>
                                </div>
                            )}

                            <div className="review-meta">
                              <div className="review-stats">
                                <div className="stat-badge">
                                  <Eye className="stat-icon" />
                                  <span>{review.viewCount}</span>
                                </div>
                                <div className="stat-badge">
                                  <Heart className="stat-icon" />
                                  <span>{review.likeCount}</span>
                                </div>
                              </div>

                              <div className="review-actions">
                                <button
                                    onClick={(e) => handleEditReview(e, review.reviewId)}
                                    className="action-button edit"
                                    title="수정"
                                >
                                  <Edit3 size={12} />
                                  수정
                                </button>
                                <button
                                    onClick={(e) => handleDeleteReview(e, review.reviewId, review.title)}
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

export default MyReview;
