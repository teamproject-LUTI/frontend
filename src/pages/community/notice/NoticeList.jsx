// src/pages/community/notice/NoticeList.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../../styles/community/notice/NoticeList.css';
import Pagination from "../../../components/common/Pagination";

const NoticeList = () => {
    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(1);
    const size = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // 사용자 정보 조회
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await axios.get('/api/auth/me');
                if (res.data.success) {
                    setUserInfo(res.data.user);
                }
            } catch (err) {
                console.error('사용자 정보 조회 실패:', err);
                setUserInfo(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserInfo();
    }, []);

    // 공지사항 목록 조회
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await axios.get('/api/notices', {
                    params: { page, size }
                });
                // API returns MultiResponseDto<NoticeResponseDto>
                setNotices(res.data.data || []);
                setTotalPages(res.data.pageInfo?.totalPages || 1);
            } catch (err) {
                console.error('공지사항 목록 조회 실패:', err);
            }
        };
        fetchNotices();
    }, [page]);

    // 관리자 여부 확인 (userTypeId가 2인 경우)
    const isAdmin = userInfo?.userTypeId === 2;

    // 로딩 중일 때는 로딩 표시
    if (isLoading) {
        return (
            <div className="main-layout">
                <div className="main-content-wrapper">
                    <main className="main-content">
                        <div>로딩 중...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="main-layout">
            <div className="main-content-wrapper">
                <main className="main-content">
                    <div className="notice-header">
                        <h1>공지사항</h1>
                        {/* 관리자일 때만 글쓰기 버튼 표시 */}
                        {isAdmin && (
                            <button
                                type="button"
                                className="write-button"
                                onClick={() => navigate('/community/notice/write')}
                            >
                                글쓰기
                            </button>
                        )}
                    </div>

                    <table className="notice-table">
                        <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>조회수</th>
                        </tr>
                        </thead>
                        <tbody>
                        {notices.map((n) => (
                            <tr
                                key={n.noticeId}
                                onClick={() => navigate(`/community/notice/${n.noticeId}`)}
                                className="notice-row"
                            >
                                <td>{n.noticeId}</td>
                                <td className="notice-title">{n.title}</td>
                                <td>{n.userName}</td>
                                <td>{n.createdAt.substring(0, 10)}</td>
                                <td>{n.viewCount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={page === i + 1 ? 'active' : ''}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NoticeList;