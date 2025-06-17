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

    useEffect(() => {
        const fetchReview = async () => {
            try {
                const res = await axios.get(`/api/reviews/${id}`);
                setReview(res.data.data); // 리뷰 내용
                setLikeCount(res.data.data.likeCount);
                // ❗여기선 isLiked는 별도 API 요청이 필요함
            } catch (err) {
                console.error('리뷰 조회 실패', err);
            }
        };

        fetchReview();
    }, [id]);

    const handleLike = () => {
        const updated = isLiked ? likeCount - 1 : likeCount + 1;
        setLikeCount(updated);
        setIsLiked(!isLiked);
        // TODO: 서버에 좋아요/취소 API 호출 추가
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
