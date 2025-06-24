// src/pages/MyReview.jsx   (파일 이름·컴포넌트명 유지)

import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../../styles/community/review/ReviewList.css';
import axios from 'axios';

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [page, setPage] = useState(1);
    const size = 9;
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [myStats, setMyStats] = useState({posts: 0, views: 0, likes: 0});
    const [modalOpen, setModalOpen] = useState(false);
    const [likeUsers, setLikeUsers] = useState([]);

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const res = await axios.get('/api/reviews/myreviews/list', {
                    params: {page, size},
                });
                setReviews(res.data.data || []);
                setTotalPages(res.data.pageInfo?.totalPages || 1);
            } catch (e) {
                console.error('내 리뷰 목록 조회 실패:', e);
            }
        };
        fetchMyReviews();
    }, [page]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [cnt, views, likes] = await Promise.all([
                    axios.get('/api/reviews/myreviews/count', {withCredentials: true}),
                    axios.get('/api/reviews/myreviews/views', {withCredentials: true}),
                    axios.get('/api/reviews/myreviews/likes', {withCredentials: true}),
                ]);
                setMyStats({posts: cnt.data, views: views.data, likes: likes.data});
            } catch (e) {
                console.error('통계 조회 실패:', e);
            }
        };
        fetchStats();
    }, []);

    const openModal = async (e, reviewId) => {
        e.stopPropagation();

        try {
            // ★ 경로는 사용자가 제공한 형태 유지
            const {data} = await axios.get(`/api/reviews/list/${reviewId}/likes`);
            setLikeUsers(data);
        } catch (err) {
            console.error('좋아요 목록 조회 실패:', err);
            setLikeUsers([]);
        }
        setModalOpen(true);
    };

    return (
        <>
            {/* ===== 메인 레이아웃 ===== */}
            <div className="main-layout">
                <div className="main-content-wrapper">
                    <main className="main-content">
                        {/* 헤더 */}
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

                        {/* 통계 */}
                        <ul className="review-stats">
                            <li><p className="stat-count">{myStats.posts}</p><p className="stat-label">총 리뷰</p></li>
                            <li><p className="stat-count">{myStats.views}</p><p className="stat-label">총 조회수</p></li>
                            <li><p className="stat-count">{myStats.likes}</p><p className="stat-label">총 좋아요</p></li>
                        </ul>

                        {/* 리뷰 카드 그리드 */}
                        <ul className="review-grid">
                            {reviews.map((r) => (
                                <div
                                    key={r.reviewId}
                                    className="review-item"
                                    onClick={() => navigate(`/community/review/${r.reviewId}`)}
                                >
                                    {/* 썸네일 */}
                                    <img
                                        src={r.thumbnailPath || '/images/no_Image.png'}
                                        alt={r.thumbnailPath ? '썸네일' : '기본 썸네일'}
                                        className="review-thumbnail"
                                    />

                                    <div className="review-content">
                                        {/* 제목 + 하트 */}
                                        <div className="m-review-title">
                                            <h3 className="title-text">{r.title}</h3>
                                            <img
                                                src={r.liked
                                                    ? '/images/community/heart-filled.png'
                                                    : '/images/community/heart-empty.png'}
                                                alt={r.liked ? '좋아요 눌림' : '좋아요 안눌림'}
                                                className="heart-img"
                                            />
                                        </div>

                                        {/* 조회 / 좋아요 */}
                                        <div className="review-meta">
                                            <span className="view-count">{r.viewCount}</span>
                                            <span
                                                className="like-count"
                                                style={{cursor: 'pointer'}}
                                                onClick={(e) => openModal(e, r.reviewId)}
                                            >
                                                {r.likeCount}
                                            </span>
                                        </div>

                                        {/* 작성자 · 날짜 */}
                                        <div className="review-meta">
                                            <span className="author">{r.userName}</span>
                                            <span className="date">{r.createdAt.substring(0, 10)}</span>
                                        </div>

                                        {/* ▼ 드롭다운 렌더링은 사용 안 함 ▼ */}
                                    </div>
                                </div>
                            ))}
                        </ul>

                        {/* 페이지네이션 */}
                        <div className="pagination">
                            <button disabled={page === 1} onClick={() => setPage(page - 1)}>이전</button>
                            {Array.from({length: totalPages}, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={page === i + 1 ? 'active' : ''}
                                    onClick={() => setPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>다음</button>
                        </div>
                    </main>
                </div>
            </div>

            {/* ===== 모달 ===== */}
            {modalOpen && (
                <div
                    className="like-user-list-modal-overlay"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="like-user-list-modal-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="luti-like-scroll">
                            {likeUsers.length === 0 ? (
                                <p>아직 좋아요가 없습니다.</p>
                            ) : (
                                likeUsers.map((u) => (
                                    <div key={u.userId} className="m-like-user">
                                        <div className="m-like-user-info">
                                            <img
                                                src={u.profileImageUrl || '/images/default_profile.png'}
                                                alt="프로필"
                                            />
                                            <span>{u.nickname}</span>
                                        </div>
                                        <img
                                            src="/images/community/heart-filled.png"
                                            className="heart"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReviewList;
