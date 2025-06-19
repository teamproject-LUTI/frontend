// src/components/community/review/LikeButton.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const LikeButton = ({ initialLiked, initialCount }) => {
    const { id } = useParams();
    const token = localStorage.getItem('accessToken');
    const [isLiked, setIsLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialCount);

    const handleLike = async () => {
        try {
            let res;
            if (!isLiked) {
                res = await axios.post(
                    '/api/likes',
                    { reviewId: id },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                res = await axios.delete(
                    '/api/likes',
                    {
                        data: { reviewId: id },
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
            }
            setLikeCount(res.data.likeCount);
            setIsLiked(!isLiked);
        } catch (err) {
            console.error('좋아요 처리 실패', err);
        }
    };

    return (
        <div className="like-section">
            <img
                src={isLiked ? '/images/community/heart-filled.png' : '/images/community/heart-empty.png'}
                alt="좋아요"
                className="heart-img"
                onClick={handleLike}
            />
            <span className="like-count">{likeCount}</span>
        </div>
    );
};

export default LikeButton;
