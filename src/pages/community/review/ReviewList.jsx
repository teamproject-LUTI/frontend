import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, ChevronDown  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/review/ReviewList.css';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const size = 9;
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1);
  //검색창 - 입력 중 상태
  const [inputSearchType, setInputSearchType] = useState('title');
  const [inputKeyword, setInputKeyword] = useState('');
  // 검색창 - 실제 검색에 사용될 상태
  const [searchType, setSearchType] = useState('title');
  const [keyword, setKeyword] = useState('');
  const selectRef = useRef(null);


  // 리뷰 조회 (페이지, 검색어 변경 시마다 다시 호출)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/api/reviews', {
          params: {
            page,
            size,
            sort: 'createdAt,desc',
            searchType,   // 실제 검색용 상태
            keyword,       // handleSearch 시점에만 바뀜
          },
        });
        console.log("서버 응답 데이터:", response.data);
        setReviews(response.data.data || []);
        setTotalPages(response.data.pageInfo?.totalPages || 1);
      } catch (error) {
        console.error('리뷰 목록 조회 실패:', error);
      }
    };
    fetchReviews();
  }, [page, searchType, keyword]);

  // 검색 버튼 클릭 핸들러: 페이지를 1로 초기화
  const handleSearch = () => {
    setPage(1);
    // useEffect에서 searchType, keyword가 바뀌면 자동으로 재호출 됩니다.
    setSearchType(inputSearchType);
    setKeyword(inputKeyword);
  };

  return (
      <div className="main-layout">
        <Topbar />
        <div className="main-content-wrapper">
          <Sidebar />
          <main className="main-content">
            <div className="review-header">
              <h1>여행 후기</h1>

              {/* 검색 컨트롤: 글쓰기 버튼 왼쪽 배치 */}
              <div className="search-controls">
                <div className="select-wrapper">
                  <select
                      ref={selectRef}
                      value={inputSearchType}
                      onChange={e => setInputSearchType(e.target.value)}
                  >
                    <option value="title">제목</option>
                    <option value="author">작성자</option>
                    <option value="travelRegion">여행지역</option>
                  </select>
                  <ChevronDown className="review-list-select-icon"
                               size={16}
                  />
                </div>
                <div className="search-input-wrapper">
                  <input
                      type="text"
                      placeholder="검색어를 입력하세요"
                      value={inputKeyword}
                      onChange={e => setInputKeyword(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                  <Search
                      className="review-list-search-icon"
                      size={18}
                      onClick={handleSearch}
                  />
                </div>
              </div>

              <button
                  type="button"
                  className="review-list-write-button"
                  onClick={() => navigate('/community/review/write')}
              >
                글쓰기
              </button>
            </div>

            <ul className="review-grid">
              {reviews.map((r) => (
                  <div key={r.reviewId}
                       className="review-item"
                       onClick={() => navigate(`/community/review/${r.reviewId}`)}>
                    {/* 썸네일 이미지 */}
                    <img
                        src={r.thumbnailPath || "/images/no_Image.png"}
                        alt={r.thumbnailPath ? "썸네일" : "기본 썸네일"}
                        className="review-thumbnail"
                    />
                    <div className="review-content">
                      <div className="review-title-box">
                        <h3 className="list-title-text">{r.title}</h3>
                        {/* isLiked가 true면 채워진 하트, false면 빈 하트 보여주기 */}
                        <img
                            src={ r.liked
                                ? "/images/community/heart-filled.png"
                                : "/images/community/heart-empty.png"
                            }
                            alt={ r.liked ? "좋아요 눌림" : "좋아요 안눌림" }
                            className="heart-img"
                        />
                      </div>
                      <div className="review-list-meta">
                        <p className="author">{r.userName}</p>
                        <p className="date">{r.createdAt.substring(0, 10)}</p>
                      </div>
                    </div>
                  </div>
              ))}
            </ul>

            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                이전
              </button>

              {/* 페이지 번호 버튼들 */}
              {Array.from({ length: totalPages }, (_, i) => (
                  <button
                      key={i + 1}
                      className={page === i + 1 ? 'active' : ''}
                      onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
              ))}

              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                다음
              </button>
            </div>

          </main>
        </div>
        <Footer />
      </div>
  );
};

export default ReviewList;
