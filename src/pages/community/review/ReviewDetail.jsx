import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/review/ReviewDetail.css'; // 스타일 분리

const ReviewDetail = () => {
    const { id } = useParams();
    const [review, setReview] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // 임시 더미 데이터
    useEffect(() => {
        const dummy = {
            id,
            title: '2박 3일 제주도 여행 후기',
            content: '<p>정말 최고의 힐링이었어요! 사진도 많이 찍고...</p>',
            likeCount: 5,
        };
        setReview(dummy);
        setLikeCount(dummy.likeCount);
    }, [id]);

    const handleLike = () => {
        const updated = isLiked ? likeCount - 1 : likeCount + 1;
        setLikeCount(updated);
        setIsLiked(!isLiked);
    };

    if (!review) return <p>로딩 중...</p>;

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
