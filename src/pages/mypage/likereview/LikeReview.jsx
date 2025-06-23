import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  HeartOff,
  User,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Eye,
  ImageIcon
} from 'lucide-react';
import apiClient from '../../../util/apiClient';
import Swal from 'sweetalert2';
import '../../../styles/MyPage/LikeReview.css';
import { useAuth } from "../../../util/AuthContext";

const LikeReview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 상태 관리
  const [likedReviews, setLikedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLikedReviews: 0
  });

  // 페이지네이션 (백엔드 기반)
  const [currentPage, setCurrentPage] = useState(0); // 백엔드는 0부터 시작
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10); // 한 페이지에 10개씩

  // 검색 상태 분리 (수동 검색)
  const [searchInput, setSearchInput] = useState(''); // 입력 중인 검색어
  const [searchType, setSearchType] = useState(''); // '', 'title', 'content', 'author'
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'oldest'

  // 실제 검색된 조건들 (API 호출에 사용)
  const [actualKeyword, setActualKeyword] = useState('');
  const [actualSearchType, setActualSearchType] = useState('');
  const [actualSortBy, setActualSortBy] = useState('latest');

  // 이미지 URL 처리 함수
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    // 절대 URL인 경우 그대로 반환
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // 상대 경로인 경우 API_BASE_URL과 결합
    return `${API_BASE_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // 좋아요한 리뷰 목록 조회 (백엔드 페이지네이션 사용)
  const fetchLikedReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user || !user.userId) {
        console.log('사용자 정보 없음 - API 호출 건너뜀');
        setLoading(false);
        return;
      }

      console.log('좋아요한 리뷰 목록 조회 시작...', {
        userId: user.userId,
        searchType: actualSearchType,
        keyword: actualKeyword,
        sortBy: actualSortBy,
        page: currentPage,
        size: pageSize
      });

      // 백엔드 페이지네이션 API 호출
      const response = await apiClient.get(`/api/likes/user/${user.userId}/search`, {
        params: {
          searchType: actualSearchType,
          keyword: actualKeyword,
          sortBy: actualSortBy,
          page: currentPage,
          size: pageSize
        }
      });

      if (response.status === 200) {
        const data = response.data;

        setLikedReviews(data.data || []);
        setTotalPages(data.pageInfo?.totalPages || 0);
        setTotalElements(data.pageInfo?.totalElements || 0);
        setStats({
          totalLikedReviews: data.pageInfo?.totalElements || 0
        });

        console.log('좋아요한 리뷰 목록 조회 성공:', data);
      }

    } catch (error) {
      console.error('좋아요한 리뷰 목록 조회 중 오류:', error);

      if (error.response?.status === 401) {
        console.log('인증 오류 - 로그인 페이지로 리다이렉트');
        return;
      }

      setError(error.message || '좋아요한 리뷰 목록을 불러오는데 실패했습니다.');
      setLikedReviews([]);

    } finally {
      setLoading(false);
    }
  }, [user?.userId, actualSearchType, actualKeyword, actualSortBy, currentPage, pageSize]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (user && user.userId) {
      fetchLikedReviews();
    }
  }, [fetchLikedReviews, user]);

  // 검색 실행 (버튼 클릭 또는 엔터키)
  const handleSearch = () => {
    setActualKeyword(searchInput.trim());
    setActualSearchType(searchType);
    setActualSortBy(sortBy);
    setCurrentPage(0); // 검색 시에만 첫 페이지로 이동
  };

  // 엔터키 검색
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색 타입 변경 (검색 실행 안 함)
  const handleSearchTypeChange = (newSearchType) => {
    setSearchType(newSearchType);
    // 검색은 실행하지 않음
  };

  // 정렬 변경 (즉시 적용)
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setActualSortBy(newSortBy);
    // 정렬은 즉시 적용 (검색어가 있든 없든)
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 리뷰 상세 보기
  const handleReviewClick = (reviewId) => {
    navigate(`/community/review/${reviewId}`);
  };

  // 좋아요 취소
  const handleUnlikeReview = async (e, reviewId, title) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    const result = await Swal.fire({
      title: '좋아요 취소',
      html: `
        <p style="margin-bottom: 10px;">이 리뷰의 좋아요를 취소하시겠습니까?</p>
        <p style="font-weight: bold; color: #374151;">"${title}"</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '좋아요 취소',
      cancelButtonText: '유지'
    });

    if (result.isConfirmed) {
      try {
        const response = await apiClient.delete(`/api/likes`, {
          data: { reviewId: reviewId }
        });

        if (response.status === 200) {
          await Swal.fire({
            title: '좋아요 취소 완료!',
            text: '해당 리뷰의 좋아요가 취소되었습니다.',
            icon: 'success',
            confirmButtonColor: '#F76B59',
            timer: 1500
          });

          // 목록 새로고침
          fetchLikedReviews();
        } else {
          throw new Error('좋아요 취소에 실패했습니다.');
        }

      } catch (error) {
        console.error('좋아요 취소 중 오류:', error);

        await Swal.fire({
          title: '취소 실패',
          text: error.response?.data?.error || '좋아요 취소 중 오류가 발생했습니다.',
          icon: 'error',
          confirmButtonColor: '#F76B59'
        });
      }
    }
  };

  // 리뷰 탐색하기
  const handleExploreReviews = () => {
    navigate('/community/review');
  };

  // 재시도
  const handleRetry = () => {
    setError(null);
    fetchLikedReviews();
  };

  // 페이지네이션 버튼 생성
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;

    let start = Math.max(0, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages - 1, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(0, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
          <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          >
            {i + 1}
          </button>
      );
    }

    return buttons;
  };

  return (
        <div className="like-review-container">
          <div className="like-review-content">
            {/* 헤더 */}
            <div className="like-review-header">
              <div className="like-review-title">
                <Heart className="like-review-icon" />
                <h1>찜한 리뷰</h1>
              </div>
              <p className="like-review-subtitle">
                내가 좋아요를 누른 여행 후기 목록입니다.
              </p>
            </div>

            {/* 통계 정보 */}
            <div className="like-review-stats">
              <div className="stat-item">
                <Heart className="stat-icon" />
                <span className="stat-number">{stats.totalLikedReviews}</span>
                <span className="stat-label">좋아요한 리뷰</span>
              </div>
            </div>

            <div className="like-review-filters mylike-review-filters">
              {/* 통합 검색 그룹 */}
              <div className="mylike-integrated-search-group">
                <div className="mylike-integrated-search-wrapper">
                  {/* 검색 타입 선택 */}
                  <select
                      value={searchType}
                      onChange={(e) => handleSearchTypeChange(e.target.value)}
                      className="mylike-search-type-select"
                  >
                    <option value="">전체</option>
                    <option value="title">제목</option>
                    <option value="content">내용</option>
                    <option value="author">작성자</option>
                  </select>

                  {/* 검색 입력창 */}
                  <input
                      type="text"
                      placeholder="검색어를 입력하세요..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="mylike-integrated-search-input"
                  />

                  {/* 검색 버튼 */}
                  <button
                      onClick={handleSearch}
                      className="mylike-integrated-search-button"
                      title="검색"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>

              {/* 정렬 그룹 */}
              <div className="mylike-sort-group">
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="mylike-sort-select"
                >
                  <option value="latest">최근 좋아요순</option>
                  <option value="oldest">오래된 좋아요순</option>
                </select>
              </div>
            </div>

            {/* 검색 결과 정보 */}
            {actualKeyword && !loading && (
                <div className="search-result-info mylike-search-result-info">
                  <p>
                    {actualSearchType ? (
                        <>
                          <strong>
                            {actualSearchType === 'title' ? '제목' :
                                actualSearchType === 'content' ? '내용' :
                                    actualSearchType === 'author' ? '작성자' : '전체'}
                          </strong>에서 "<strong>{actualKeyword}</strong>" 검색 결과: <strong>{totalElements}</strong>개
                        </>
                    ) : (
                        <>
                          "<strong>{actualKeyword}</strong>" 검색 결과: <strong>{totalElements}</strong>개
                        </>
                    )}
                  </p>
                </div>
            )}

            {/* 리뷰 리스트 */}
            <div className="like-review-list">
              {loading ? (
                  <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">좋아요한 리뷰를 불러오는 중...</p>
                  </div>
              ) : error ? (
                  <div className="error-section">
                    <p className="error-message">⚠️ {error}</p>
                    <button onClick={handleRetry} className="retry-button">
                      다시 시도
                    </button>
                  </div>
              ) : likedReviews.length === 0 ? (
                  <div className="empty-state mylike-empty-state">
                    <Heart className="empty-icon" />
                    <h3 className="empty-title">
                      {actualKeyword ? '검색 결과가 없습니다' : '좋아요한 리뷰가 없습니다'}
                    </h3>
                    <p className="empty-description">
                      {actualKeyword ? '다른 검색어로 시도해보세요.' : '마음에 드는 리뷰에 좋아요를 눌러보세요!'}
                    </p>
                    {!actualKeyword && (
                        <button
                            onClick={handleExploreReviews}
                            className="explore-button"
                        >
                          리뷰 탐색하기
                        </button>
                    )}
                  </div>
              ) : (
                  <>
                    <div className="review-grid">
                      {likedReviews.map((review) => (
                          <div
                              key={review.reviewId}
                              className="review-card"
                              onClick={() => handleReviewClick(review.reviewId)}
                          >
                            {/* 리뷰 이미지 섹션 */}
                            <div className="review-image-section">
                              {review.thumbnailPath ? (
                                  <img
                                      src={getImageUrl(review.thumbnailPath)}
                                      alt={review.title}
                                      className="review-image"
                                      onError={(e) => {
                                        // 이미지 로드 실패 시 대체 이미지 표시
                                        e.target.style.display = 'none';
                                        e.target.nextElementSibling.style.display = 'flex';
                                      }}
                                  />
                              ) : null}
                              <div
                                  className="review-image-placeholder"
                                  style={{
                                    display: review.thumbnailPath ? 'none' : 'flex'
                                  }}
                              >
                                <ImageIcon className="placeholder-icon" />
                                <span>이미지 없음</span>
                              </div>

                              {/* 좋아요 취소 버튼 - 이미지 위에 오버레이 */}
                              <button
                                  onClick={(e) => handleUnlikeReview(e, review.reviewId, review.title)}
                                  className="unlike-button overlay"
                                  title="좋아요 취소"
                              >
                                <HeartOff size={16} />
                              </button>
                            </div>

                            {/* 리뷰 정보 섹션 */}
                            <div className="review-info-section">
                              <div className="review-card-header">
                                <h3 className="review-title">{review.title}</h3>
                              </div>

                              <div className="review-meta-info">
                                <div className="author-info">
                                  <User size={14} />
                                  <span>{review.authorName}</span>
                                </div>
                                {review.travelRegion && (
                                    <div className="region-info">
                                      <MapPin size={14} />
                                      <span>{review.travelRegion}</span>
                                    </div>
                                )}
                              </div>

                              {review.travelPeriod && (
                                  <div className="travel-period">
                                    <Calendar size={14} />
                                    <span>{review.travelPeriod}</span>
                                  </div>
                              )}

                              <div className="review-bottom">
                                <div className="review-stats">
                                  <div className="stat-item">
                                    <Heart size={14} className="like-icon" />
                                    <span>{review.likeCount || 0}</span>
                                  </div>
                                  <div className="stat-item">
                                    <Eye size={14} className="view-icon" />
                                    <span>{review.viewCount || 0}</span>
                                  </div>
                                </div>
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
                              disabled={currentPage === 0}
                              className="pagination-button"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {renderPaginationButtons()}

                          <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage >= totalPages - 1}
                              className="pagination-button"
                          >
                            <ChevronRight size={16} />
                          </button>

                        </div>
                    )}
                  </>
              )}
            </div>
          </div>
        </div>
  );
};

export default LikeReview;
