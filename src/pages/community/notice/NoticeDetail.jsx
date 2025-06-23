import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../../styles/community/notice/NoticeDetail.css';
import CommentSection from "../comment/CommentSection";

const NoticeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);
    const token = localStorage.getItem('accessToken');

    // 중복 호출 방지를 위한 ref
    const hasViewCountIncreased = useRef(false);

    useEffect(() => {
        // 이미 조회수가 증가했다면 더 이상 호출하지 않음
        if (hasViewCountIncreased.current) return;

        const fetchNotice = async () => {
            try {
                const res = await axios.get(`/api/notices/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dto = res.data.data;
                setNotice(dto);

                // 조회수 증가 완료 표시
                hasViewCountIncreased.current = true;
            } catch (err) {
                console.error('공지글 조회 실패', err);
                alert('공지 내용을 불러오지 못했습니다.');
            }
        };

        fetchNotice();
    }, [id, token]); // token이 변경될 때만 재실행

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
                await axios.delete(`/api/notices/${id}`, {
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
            <div className="main-content-wrapper">
                <main className="main-content">
                    <h1 className="detail-title">{notice.title}</h1>

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

                    {notice.owner && (
                        <div className="crud-buttons">
                            <button className="edit-btn" onClick={handleEdit}>수정</button>
                            <button className="delete-btn" onClick={handleDelete}>삭제</button>
                        </div>
                    )}

                    <button className="back-btn" onClick={() => navigate('/community/notice')}>
                        목록으로
                    </button>
                    {/* 댓글 섹션 추가 */}
                    <CommentSection
                        parentType="NOTICE"
                        parentId={id}
                    />
                </main>
            </div>
        </div>
    );
};

export default NoticeDetail;