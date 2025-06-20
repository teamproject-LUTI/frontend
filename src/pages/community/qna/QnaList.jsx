// src/pages/community/qna/QnaList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/qna/QnaList.css';

const QnaList = () => {
    const [asks, setAsks] = useState([]);
    const [page, setPage] = useState(1);
    const size = 10; // 한 페이지당 항목 수
    const [totalPages, setTotalPages] = useState(1);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAsks = async () => {
            try {
                const res = await axios.get('/api/asks', {
                    params: { page, size }
                });
                // 응답 예시: { data: [ {...}, ... ], pageInfo: { totalPages: x, ... } }
                setAsks(res.data.data || []);
                setTotalPages(res.data.pageInfo?.totalPages || 1);
            } catch (err) {
                console.error('문의 목록 조회 실패', err);
            }
        };
        fetchAsks();
    }, [page]);

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    {/* 헤더 */}
                    <div className="qna-header">
                        <h1>문의 내역</h1>
                        <button
                            type="button"
                            className="ask-button"
                            onClick={() => navigate('/community/qna/write')}
                        >
                            질문하기
                        </button>
                    </div>

                    {/* 테이블 */}
                    <table className="qna-table">
                        <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>답변여부</th>
                        </tr>
                        </thead>
                        <tbody>
                        {asks.map((a) => (
                            <tr
                                key={a.askId}
                                onClick={() => navigate(`/community/qna/${a.askId}`)}
                                className="qna-row"
                            >
                                <td>{a.askId}</td>
                                <td className="title-cell">{a.title}</td>
                                <td>{a.userName}</td>
                                <td>{a.createdAt.substring(0, 10)}</td>
                                <td>
                                    {a.answered
                                        ? <span className="badge badge-success">답변 완료</span>
                                        : <span className="badge badge-pending">답변 대기중</span>
                                    }
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 페이지네이션 */}
                    <div className="pagination">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
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
                            onClick={() => setPage(p => p + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default QnaList;
