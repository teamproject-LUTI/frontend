import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import '../../../styles/community/review/ReviewList.css';
import axios from "axios";

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const size = 9;
    const navigate = useNavigate();
    const [totalPages, setTotalPages] = useState(1);
    const [myStats, setMyStats] = useState({posts: 0, views: 0, likes: 0});

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const response = await axios.get('/api/reviews/myreviews/list', {
                    params: {page, size},
                });
                setReviews(response.data.data || []);
                setTotalPages(response.data.pageInfo?.totalPages || 1);
            } catch (error) {
                console.error('내 리뷰 목록 조회 실패:', error);
            }
        };
        fetchMyReviews();
    }, [page]);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [cnt, views, likes] = await Promise.all([axios.get('/api/reviews/myreviews/count', {withCredentials: true}), axios.get('/api/reviews/myreviews/views', {withCredentials: true}), axios.get('/api/reviews/myreviews/likes', {withCredentials: true})]);
                setMyStats({
                    posts: cnt.data, views: views.data, likes: likes.data
                });
            } catch (err) {
                console.error('통계 조회 실패:', err);
            }
        };
        fetchStats();
    }, []);

    return (<div className="main-layout">
        <div className="main-content-wrapper">
            <main className="main-content">
                <div className="review-header">
                    <h1>내가 쓴 리뷰</h1>
                    <button
                        type="button"
                        className="write-button"
                        onClick={() => navigate('/community/review/write')}
                    >
                        글쓰기
                    </button>
                </div>
                <ul className="review-stats">
                    <li>
                        <p className="stat-count">{myStats.posts}</p>
                        <p className="stat-label">총 리뷰</p>
                    </li>
                    <li>
                        <p className="stat-count">{myStats.views}</p>
                        <p className="stat-label">총 조회수</p>
                    </li>
                    <li>
                        <p className="stat-count">{myStats.likes}</p>
                        <p className="stat-label">총 좋아요</p>
                    </li>
                </ul>
                <ul className="review-grid">
                    {reviews.map((r) => (<div key={r.reviewId}
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
                                        src={r.liked ? "/images/community/heart-filled.png" : "/images/community/heart-empty.png"}
                                        alt={r.liked ? "좋아요 눌림" : "좋아요 안눌림"}
                                        className="heart-img"
                                    />
                                </div>
                                {/* 조회수 좋아요 정보 */}
                                <div className="review-meta">
                                    <span  className="view-count">{r.viewCount}</span>
                                    <span className="like-count">{r.likeCount}</span>
                                </div>
                                {/* 🆕 메타 정보 */}
                                <div className="review-meta">
                                    <span className="author">{r.userName}</span>
                                    <span className="date">{r.createdAt.substring(0, 10)}</span>
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
                    {Array.from({length: totalPages}, (_, i) => (<button
                        key={i + 1}
                        className={page === i + 1 ? 'active' : ''}
                        onClick={() => setPage(i + 1)}
                    >
                        {i + 1}
                    </button>))}

                    <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                        다음
                    </button>
                </div>
            </main>
        </div>
    </div>);
};

export default ReviewList;
