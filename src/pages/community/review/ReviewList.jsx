import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/community/review/ReviewList.css';
import axios from 'axios';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const size = 9;
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/api/reviews', {
          params: { page, size },
        });
        console.log("서버 응답 데이터:", response.data); // ✅ 여기에 확인 로그 추가
        setReviews(response.data.data || []);
        setTotalPages(response.data.pageInfo?.totalPages || 1);
      } catch (error) {
        console.error('리뷰 목록 조회 실패:', error);
      }
    };
    fetchReviews();
  }, [page]);

    return (
        <div className="main-layout">
      <div className="main-content-wrapper">
        <main className="main-content">
          <div className="review-header">
            <h1>여행 후기</h1>
            <button
                type="button"
                className="write-button"
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
                    <div className="review-title">
                      <h3 className="title-text">{r.title}</h3>
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
                    <div className="review-meta">
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
    </div>
    );
};

export default ReviewList;
