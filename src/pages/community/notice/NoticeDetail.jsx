import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/notice/NoticeDetail.css';

const NoticeDetail = () => {
    const { id } = useParams();  // 해당 공지글의 ID를 받아옵니다.
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);  // 공지글 상태
    const token = localStorage.getItem('accessToken');  // 로컬스토리지에서 JWT 가져오기

    useEffect(() => {
        // 공지글 조회 API 호출
        const fetchNotice = async () => {
            try {
                const res = await axios.get(`/api/notice/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }   // 인증 헤더 추가
                });
                const dto = res.data.data;
                setNotice(dto);
            } catch (err) {
                console.error('공지글 조회 실패', err);
            }
        };
        fetchNotice();
    }, [id, token]);

    // 수정 버튼 핸들러
    const handleEdit = () => {
        navigate(`/community/notice/edit/${id}`);
    };

    // 삭제 버튼 핸들러
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '정말 삭제할까요?',
            text: '삭제하면 되돌릴 수 없어요!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F76B59',
            cancelButtonColor: '#d3d3d3',
            confirmButtonText: '삭제',
            cancelButtonText: '취소',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/notice/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await Swal.fire({
                    title: '삭제 완료!',
                    text: '글이 삭제되었어요.',
                    icon: 'success',
                    confirmButtonColor: '#F76B59',
                });
                navigate('/community/notice');
            } catch (err) {
                console.error('삭제 실패', err);
                Swal.fire({
                    title: '삭제 실패',
                    text: '문제가 발생했어요. 잠시 후 다시 시도해주세요.',
                    icon: 'error',
                    confirmButtonColor: '#F76B59',
                });
            }
        }
    };

    if (!notice) return null;

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <h1 className="detail-title">{notice.title}</h1>

                    {/* 작성자 + 날짜 */}
                    <div className="detail-meta">
                        <span className="detail-author">{notice.userName}</span>
                        <span className="detail-date">
                            {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            })}
                        </span>
                    </div>

                    <div
                        className="detail-content"
                        dangerouslySetInnerHTML={{ __html: notice.content }}
                    ></div>

                    {/* 내가 쓴 글일 때만 버튼 보이기 */}
                    {notice.owner && (
                        <div className="crud-buttons">
                            <button className="edit-btn" onClick={handleEdit}>수정</button>
                            <button className="delete-btn" onClick={handleDelete}>삭제</button>
                        </div>
                    )}

                    <button className="back-btn" onClick={() => navigate('/community/notice')}>
                        목록으로
                    </button>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default NoticeDetail;
