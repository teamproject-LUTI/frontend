import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/review/ReviewDetail.css';

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // 로컬스토리지에 저장된 JWT 가져오기
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await axios.get(`/api/reviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }   // ← 인증 헤더 추가
                });
                const dto = res.data.data;
                setReview(dto);
                setLikeCount(dto.likeCount);
                setIsLiked(dto.liked);

            } catch (err) {
                console.error('리뷰 조회 실패', err);
            }
        };
        fetchReview();
    }, [id, token]);

    const handleLike = async () => {
        try {
            let res;
            if (!isLiked) {
                // 좋아요 저장
                res = await axios.post(
                    '/api/likes',
                    { reviewId: id },
                    { headers: { Authorization: `Bearer ${token}` } }  // ← 인증 헤더
                );
            } else {
                // 좋아요 취소
                res = await axios.delete(
                    '/api/likes',
                    {
                        data: { reviewId: id },
                        headers: { Authorization: `Bearer ${token}` }    // ← 인증 헤더
                    }
                );
            }
            setLikeCount(res.data.likeCount);
            setIsLiked(!isLiked);
        } catch (err) {
            console.error('좋아요 처리 실패', err);
        }
    };

    // 2) 첨부파일만 가져오는 useEffect 추가
    useEffect(() => {
        const fetchAttachments = async () => {
            try {
                const res = await axios.get(`/api/reviews/${id}/attachments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAttachments(res.data.data || []);
            } catch (err) {
                console.error('첨부파일 조회 실패', err);
            }
        };
        fetchAttachments();
    }, [id, token]);

    // 수정 버튼 핸들러
    const handleEdit = () => {
        navigate(`/community/review/edit/${id}`);
    };

    // 삭제 버튼 핸들러
    const handleDelete = async () => {
        if (!window.confirm('정말 삭제하시겠습니까?')) return;
        try {
            await axios.delete(`/api/reviews/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            navigate('/community/review');
        } catch (err) {
            console.error('삭제 실패', err);
        }
    };


    if (!review) return null;

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <h1 className="detail-title">{review.title}</h1>
                    <span className="detail-author">{review.userName}</span>
                    <span className="detail-date">

                        {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        })}
                    </span>

                    <div className="like-section">
                        <img
                            src={isLiked ? '/images/community/heart-filled.png' : '/images/community/heart-empty.png'}
                            alt="좋아요"
                            className="heart-img"
                            onClick={handleLike}
                        />
                        <span className="like-count">{likeCount}</span>
                    </div>
                    {/* 첨부 이미지 갤러리 */}
                    {attachments.length > 0 && (
                        <div className="detail-images">
                            {attachments.map(att => (
                                <img
                                    key={att.reviewAttachmentId}
                                    src={att.logicalPath}      // 서버에 매핑된 URL (/uploads/UUID.jpg)
                                    alt={att.fileName}
                                    className="detail-image"
                                />
                            ))}
                        </div>
                    )}
                    <div
                        className="detail-content"
                        dangerouslySetInnerHTML={{ __html: review.content }}
                    ></div>
                    {/*내가 쓴 글일 때만 버튼 보이기 */}
                    {review.owner && (
                        <div className="crud-buttons">
                            <button className="edit-btn" onClick={handleEdit}>수정</button>
                            <button className="delete-btn" onClick={handleDelete}>삭제</button>
                        </div>
                    )}
                    <button className="back-btn" onClick={() => navigate('/community/review')}>
                        목록으로
                    </button>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ReviewDetail;
