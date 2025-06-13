import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/review/ReviewList.css';

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);

        // 실제 API 연결 시엔 여기에 axios 등으로 불러오면 됨
        // fetchReviews().then(data => setReviews(data));


    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <div className="review-header">
                        <h1>여행 후기</h1>
                        <Link to="/community/review/write" className="write-button">
                            글쓰기
                        </Link>
                    </div>

                    
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ReviewList;
