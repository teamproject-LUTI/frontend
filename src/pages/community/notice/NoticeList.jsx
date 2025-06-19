import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/notice/NoticeList.css'; // ✅ CSS 분리 import

const NoticeList = () => {
    const [notices, setNotices] = useState([]);

    useEffect(() => {
        const dummyNotices = [
            { id: 1, title: '[공지] 사이트 점검 안내', createdAt: '2024-06-11' },
            { id: 2, title: '[이벤트] 여름 할인 쿠폰 지급', createdAt: '2024-06-08' },
        ];
        setNotices(dummyNotices);
    }, []);

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <h1>공지사항</h1>

                    <ul className="notice-list">
                        {notices.map((notice) => (
                            <li key={notice.id} className="notice-item">
                                <Link to={`/community/notice/${notice.id}`} className="notice-link">
                                    <h3>{notice.title}</h3>
                                    <p>📅 게시일: {notice.createdAt}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default NoticeList;
