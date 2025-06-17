import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/review/ReviewList.css';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const size = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get('/api/reviews', {
          params: { page, size },
        });
        console.log("서버 응답 데이터:", response.data); // ✅ 여기에 확인 로그 추가
        setReviews(response.data.data || []);
      } catch (error) {
        console.error('리뷰 목록 조회 실패:', error);
      }
    };
    fetchReviews();
  }, [page]);

    return (
        <div className="main-layout">
      <Topbar />
      <div className="main-content-wrapper">
        <Sidebar />
        <main className="main-content">
          <h2>리뷰 목록</h2>
          <ul className="review-list">
            {reviews.map((r) => (
                <li key={r.reviewNo}
                          className="review-item"
                          onClick={() => navigate(`/community/review/${r.reviewId}`)}>
                  <h3>{r.title}</h3>
                  <p>{r.createdAt.substring(0, 10)}</p>
                  <p>{r.userName}</p>
                  {/* isLiked가 true면 채워진 하트, false면 빈 하트 보여주기 */}
                  <img
                      src={ r.liked
                          ? "/images/community/heart-filled.png"
                          : "/images/community/heart-empty.png"
                      }
                      alt={ r.liked ? "좋아요 눌림" : "좋아요 안눌림" }
                      className="heart-img"
                  />

                </li>
            ))}
          </ul>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              이전
            </button>
            <span>{page}</span>
            <button onClick={() => setPage(page + 1)}>다음</button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
    );
};

export default ReviewList;
