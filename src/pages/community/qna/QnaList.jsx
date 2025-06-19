import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/qna/QnaList.css'; // ✅ CSS 파일 import

const QnaList = () => {
    const [qnaList, setQnaList] = useState([]);

    useEffect(() => {
        const dummyQna = [
            { id: 1, title: '항공권 예약 변경 문의', author: '수빈', createdAt: '2024-06-10' },
            { id: 2, title: '여권 정보 수정 가능한가요?', author: '영희', createdAt: '2024-06-09' },
        ];
        setQnaList(dummyQna);
    }, []);

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <div className="qna-header">
                        <h1>문의내역</h1>
                        <Link to="/community/qna/write" className="qna-write-btn">
                            질문하기
                        </Link>
                    </div>

                    <ul className="qna-list">
                        {qnaList.map((qna) => (
                            <li key={qna.id} className="qna-item">
                                <Link to={`/community/qna/${qna.id}`} className="qna-link">
                                    <h3>{qna.title}</h3>
                                    <p>작성자: {qna.author} | 작성일: {qna.createdAt}</p>
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

export default QnaList;
