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
  Filter
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import apiClient from '../../util/apiClient';
import Swal from 'sweetalert2';
import '../../styles/MyPage/LikeReview.css';

// 더미 데이터
const DUMMY_LIKED_REVIEWS = [
  {
    reviewId: 'dummy1',
    title: '제주도 한라산 등반 후기 - 정상에서 본 일출이 최고!',
    content: '새벽 3시에 시작한 한라산 등반, 힘들었지만 정상에서 본 일출은 정말 잊을 수 없는 경험이었습니다. 구름 바다 위로 떠오르는 태양을 보며 모든 피로가 사라졌어요.',
    authorName: '여행러버',
    likeCount: 156,
    travelRegion: '제주도',
    travelPeriod: '2024.11.15 - 2024.11.17',
    likedAt: '2024-12-20T09:30:00',
    createdAt: '2024-11-20T14:30:00'
  },
  {
    reviewId: 'dummy2',
    title: '부산 감천문화마을 야경 투어',
    content: '낮과 밤이 완전히 다른 매력을 가진 감천문화마을. 특히 야경이 정말 아름다워서 사진을 수백장 찍었네요. 골목골목 숨어있는 카페들도 분위기가 좋았습니다.',
    authorName: '부산토박이',
    likeCount: 89,
    travelRegion: '부산',
    travelPeriod: '2024.12.01 - 2024.12.03',
    likedAt: '2024-12-18T16:45:00',
    createdAt: '2024-12-05T11:20:00'
  },
  {
    reviewId: 'dummy3',
    title: '경주 불국사 단풍 여행 - 가을의 절정',
    content: '11월 초 경주 불국사의 단풍이 절정이었습니다. 천년의 역사와 함께 만나는 가을 풍경이 정말 감동적이었어요. 석굴암까지 올라가는 길도 단풍터널이 장관이었습니다.',
    authorName: '단풍헌터',
    likeCount: 234,
    travelRegion: '경주',
    travelPeriod: '2024.11.02 - 2024.11.04',
    likedAt: '2024-12-15T13:20:00',
    createdAt: '2024-11-08T16:40:00'
  },
  {
    reviewId: 'dummy4',
    title: '강릉 바다 펜션에서의 힐링 여행',
    content: '바로 앞이 바다인 펜션에서 3박 4일을 보냈습니다. 아침마다 일출을 보고, 밤에는 파도소리를 들으며 정말 힐링이 되었어요. 근처 커피거리도 분위기가 좋았습니다.',
    authorName: '바다사랑',
    likeCount: 67,
    travelRegion: '강릉',
    travelPeriod: '2024.10.20 - 2024.10.23',
    likedAt: '2024-12-10T10:15:00',
    createdAt: '2024-10-28T09:30:00'
  }
];

const LikeReview = () => {
  const navigate = useNavigate();

  // 상태 관리
  const [likedReviews, setLikedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLikedReviews: 0
  });

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(12); // 한 페이지에 12개씩

  // 필터링 및 검색
  const [sortBy, setSortBy] = useState('latest'); // latest, oldest, popular
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('all');

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

  // 더미 데이터 필터링 및 정렬 함수
  const processDummyData = (data, searchTerm, regionFilter, sortType) => {
    let processed = [...data];

    // 검색 필터링
    if (searchTerm.trim()) {
      processed = processed.filter(review =>
          review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.authorName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 지역 필터링
    if (regionFilter !== 'all') {
      processed = processed.filter(review => review.travelRegion === regionFilter);
    }

    // 정렬
    switch (sortType) {
      case 'latest':
        return processed.sort((a, b) => new Date(b.likedAt) - new Date(a.likedAt));
      case 'oldest':
        return processed.sort((a, b) => new Date(a.likedAt) - new Date(b.likedAt));
      case 'popular':
        return processed.sort((a, b) => b.likeCount - a.likeCount);
      default:
        return processed;
    }
  };

  // 좋아요한 리뷰 목록 조회
  const fetchLikedReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (useDummyData) {
        // 더미 데이터 사용
        console.log('더미 데이터 사용 중...', {
          page: currentPage,
          size: pageSize,
          sortBy,
          searchTerm,
          regionFilter
        });

        // 필터링 및 정렬된 더미 데이터
        const processedReviews = processDummyData(DUMMY_LIKED_REVIEWS, searchTerm, regionFilter, sortBy);

        // 페이지네이션 시뮬레이션
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedReviews = processedReviews.slice(startIndex, endIndex);

        setLikedReviews(paginatedReviews);
        setTotalPages(Math.ceil(processedReviews.length / pageSize));
        setStats({
          totalLikedReviews: processedReviews.length
        });

        console.log('더미 데이터 로드 완료:', {
          reviews: paginatedReviews,
          totalCount: processedReviews.length
        });

        // 로딩 시뮬레이션
        setTimeout(() => {
          setLoading(false);
        }, 500);

        return;
      }

      // 실제 API 호출
      console.log('좋아요한 리뷰 목록 조회 시작...', {
        page: currentPage,
        size: pageSize,
        sortBy,
        searchTerm,
        regionFilter
      });

      const response = await apiClient.get('/api/mypage/liked-reviews', {
        params: {
          page: currentPage - 1, // 백엔드는 0부터 시작
          size: pageSize,
          sortBy: sortBy,
          search: searchTerm || null,
          region: regionFilter === 'all' ? null : regionFilter
        }
      });

      if (response.status === 200 && response.data.success) {
        const data = response.data;

        setLikedReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);
        setStats({
          totalLikedReviews: data.totalElements || 0
        });

        console.log('좋아요한 리뷰 목록 조회 성공:', data);
      } else {
        throw new Error(response.data.error || '좋아요한 리뷰 목록을 불러오는데 실패했습니다.');
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
      if (!useDummyData) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, sortBy, searchTerm, regionFilter, useDummyData]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchLikedReviews();
  }, [fetchLikedReviews]);

  // 검색어 변경 시 첫 페이지로 이동 (디바운스 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, regionFilter]);

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

  // 좋아요 취소
  const handleUnlikeReview = async (e, reviewId, title) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지

    if (reviewId.startsWith('dummy')) {
      // 더미 데이터인 경우 알림 표시
      Swal.fire({
        title: '더미 데이터',
        text: '더미 데이터는 좋아요를 취소할 수 없습니다.',
        icon: 'info',
        confirmButtonColor: '#F76B59'
      });
      return;
    }

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
        const response = await apiClient.delete(`/api/reviews/${reviewId}/like`);

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

  // 지역 목록 (더미 데이터에서 추출)
  const regions = ['all', ...new Set(DUMMY_LIKED_REVIEWS.map(review => review.travelRegion))];

  return (
      <Layout>
        <div className="like-review-container">
          <div className="like-review-content">
            {/* 헤더 */}
            <div className="like-review-header">
              <div className="like-review-title">
                <Heart className="like-review-icon" />
                <h1>찜한 리뷰</h1>
                {useDummyData && (
                    <span className="dummy-badge">더미 데이터</span>
                )}
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

            {/* 검색 및 필터 */}
            <div className="like-review-filters">
              <div className="search-group">
                <div className="search-wrapper">
                  <Search className="search-icon" />
                  <input
                      type="text"
                      placeholder="제목이나 작성자로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                  />
                </div>
              </div>

              <div className="filter-group">
                <Filter className="filter-icon" />
                <select
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    className="filter-select"
                >
                  <option value="all">전체 지역</option>
                  {regions.slice(1).map(region => (
                      <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div className="sort-group">
                <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="sort-select"
                >
                  <option value="latest">최근 좋아요순</option>
                  <option value="oldest">오래된 좋아요순</option>
                  <option value="popular">인기순</option>
                </select>
              </div>
            </div>

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
                  <div className="empty-state">
                    <Heart className="empty-icon" />
                    <h3 className="empty-title">좋아요한 리뷰가 없습니다</h3>
                    <p className="empty-description">
                      마음에 드는 리뷰에 좋아요를 눌러보세요!
                    </p>
                    <button
                        onClick={handleExploreReviews}
                        className="explore-button"
                    >
                      리뷰 탐색하기
                    </button>
                  </div>
              ) : (
                  <>
                    <div className="review-grid">
                      {likedReviews.map((review) => (
                          <div
                              key={review.reviewId}
                              className={`review-card ${review.reviewId.startsWith('dummy') ? 'dummy-card' : ''}`}
                              onClick={() => handleReviewClick(review.reviewId)}
                          >
                            <div className="review-card-header">
                              <h3 className="review-title">{review.title}</h3>
                              <button
                                  onClick={(e) => handleUnlikeReview(e, review.reviewId, review.title)}
                                  className="unlike-button"
                                  title="좋아요 취소"
                              >
                                <HeartOff size={16} />
                              </button>
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

                            <p className="review-content">{review.content}</p>

                            {review.travelPeriod && (
                                <div className="travel-period">
                                  <Calendar size={14} />
                                  <span>{review.travelPeriod}</span>
                                </div>
                            )}

                            <div className="review-bottom">
                              <div className="like-info">
                                <Heart size={14} className="like-icon" />
                                <span>{review.likeCount}개의 좋아요</span>
                              </div>
                              <div className="liked-date">
                                {formatDate(review.likedAt)}에 좋아요
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

export default LikeReview;
