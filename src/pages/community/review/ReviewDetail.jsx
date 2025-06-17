import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/review/ReviewDetail.css';

const ReviewDetail = () => {
    const { id } = useParams(); // 경로에서 reviewNo 받음
    const [review, setReview] = useState(null);
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

    if (!review) return null;

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <h1 className="detail-title">{review.title}</h1>

                    <div className="like-section">
                        <img
                            src={isLiked ? '/images/community/heart-filled.png' : '/images/community/heart-empty.png'}
                            alt="좋아요"
                            className="heart-img"
                            onClick={handleLike}
                        />
                        <span className="like-count">{likeCount}</span>
                    </div>

                    <div
                        className="detail-content"
                        dangerouslySetInnerHTML={{ __html: review.content }}
                    ></div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ReviewDetail;
