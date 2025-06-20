// src/pages/community/qna/QnaDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/qna/QnaDetail.css';

const QnaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const [ask, setAsk] = useState(null);
    const [attachments, setAttachments] = useState([]);

    // 1) 문의글 데이터 불러오기
    useEffect(() => {
        const fetchAsk = async () => {
            try {
                const res = await axios.get(`/api/asks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // response.data.data 혹은 data 구조에 맞춰 조정
                setAsk(res.data.data || res.data);
            } catch (err) {
                console.error('문의글 조회 실패', err);
            }
        };
        fetchAsk();
    }, [id, token]);

    // 2) 첨부파일 불러오기
    useEffect(() => {
        const fetchAttachments = async () => {
            try {
                const res = await axios.get(`/api/asks/${id}/attachments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAttachments(res.data.data || []);
            } catch (err) {
                console.error('첨부파일 조회 실패', err);
            }
        };
        fetchAttachments();
    }, [id, token]);

    if (!ask) return null;

    const { title, content, createdAt, answered, userName, userId } = ask;

    // 삭제 핸들러
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '정말 삭제할까요?',
            text: '삭제하면 되돌릴 수 없습니다.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
            confirmButtonColor: '#F76B59',
            cancelButtonColor: '#d3d3d3',
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/asks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await Swal.fire('삭제 완료', '문의글이 삭제되었습니다.', 'success');
                navigate('/community/qna');
            } catch (err) {
                console.error('삭제 실패', err);
                Swal.fire('삭제 실패', '잠시 후 다시 시도해주세요.', 'error');
            }
        }
    };

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <h1 className="detail-title">{title}</h1>

                    <div className="detail-meta">
                        <span className="detail-author">{userName}</span>
                        <span className="detail-date">
              {new Date(createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: '2-digit', day: '2-digit'
              })}
            </span>
                        <span
                            className={`status-badge ${answered ? 'answered' : 'pending'}`}
                        >
              {answered ? '답변 완료' : '답변 대기중'}
            </span>
                    </div>

                    {attachments.length > 0 && (
                        <div className="detail-attachments">
                            <h3>첨부파일</h3>
                            <ul>
                                {attachments.map(att => (
                                    <li key={att.askAttachmentId}>
                                        <a href={att.logicalPath} download>
                                            {att.fileName}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div
                        className="detail-content"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />

                    {/* 본인이 작성한 글일 때만 수정/삭제 버튼 보이기 */}
                    {Number(userId) === Number(localStorage.getItem('userId')) && (
                        <div className="crud-buttons">
                            <button
                                className="edit-btn"
                                onClick={() => navigate(`/community/qna/edit/${id}`)}
                            >
                                수정
                            </button>
                            <button className="delete-btn" onClick={handleDelete}>
                                삭제
                            </button>
                        </div>
                    )}

                    <button
                        className="back-btn"
                        onClick={() => navigate('/community/qna')}
                    >
                        목록으로
                    </button>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default QnaDetail;
