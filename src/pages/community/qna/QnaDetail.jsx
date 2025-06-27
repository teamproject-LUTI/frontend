import React, { useEffect, useState, useCallback } from 'react';
import { Eye, Share2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../../styles/community/qna/QnaDetail.css';
import CommentSection from "../comment/CommentSection";

const QnaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ask, setAsk] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const token = localStorage.getItem('accessToken');

    // 문의글 정보를 다시 불러오는 함수
    const fetchAskData = useCallback(async () => {
        try {
            const res = await axios.get(`/api/asks/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dto = res.data.data;
            setAsk(dto);
        } catch (err) {
            console.error('문의글 조회 실패', err);
        }
    }, [id, token]);

    useEffect(() => {
        fetchAskData();
    }, [fetchAskData]);

    // 첨부파일 목록 조회
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

    // 댓글이 추가되었을 때 호출되는 콜백 함수
    const handleCommentAdded = useCallback(async () => {
        console.log('댓글이 추가되었습니다. 문의글 상태를 업데이트합니다.');

        try {
            // 문의글을 답변 완료로 표시
            await axios.post(`/api/asks/${id}/mark-answered`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 문의글 정보 다시 불러오기 (답변 상태 반영)
            await fetchAskData();

            console.log('문의글 답변 상태가 업데이트되었습니다.');
        } catch (err) {
            console.warn('문의글 답변 상태 업데이트 실패:', err);
            // 에러가 발생해도 댓글은 이미 생성되었으므로 사용자에게 알리지 않음
        }
    }, [id, token, fetchAskData]);

    // 다운로드 핸들러
    const handleDownload = async (attachmentId, fileName) => {
        try {
            const res = await axios.get(
                `/api/asks/${id}/attachments/${attachmentId}/download`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );
            // Blob → Object URL 생성
            const url = window.URL.createObjectURL(new Blob([res.data]));
            // 임시 <a> 태그로 다운로드 트리거
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('파일 다운로드 실패', err);
            alert('다운로드에 실패했어요.');
        }
    };

    // 공유 버튼 핸들러
    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url)
            .then(() => {
                Swal.fire({
                    title: 'URL 복사됨!',
                    text: '현재 페이지 주소가 클립보드에 복사되었습니다.',
                    icon: 'success',
                    confirmButtonColor: '#F76B59',
                });
            })
            .catch(() => {
                Swal.fire({
                    title: '복사 실패',
                    text: 'URL 복사에 실패했어요. 직접 복사해주세요.',
                    icon: 'error',
                    confirmButtonColor: '#F76B59',
                });
            });
    };

    // 수정 버튼 핸들러
    const handleEdit = () => {
        navigate(`/community/qna/edit/${id}`);
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
                await axios.delete(`/api/asks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await Swal.fire({
                    title: '삭제 완료!',
                    text: '글이 삭제되었어요.',
                    icon: 'success',
                    confirmButtonColor: '#F76B59',
                });
                navigate('/community/qna');
            } catch (err) {
                console.error('삭제 실패', err);
                if (err.response?.status === 403) {
                    Swal.fire({
                        title: '권한이 없습니다',
                        text: '작성자 또는 관리자만 삭제할 수 있습니다.',
                        icon: 'error',
                        confirmButtonColor: '#F76B59',
                    });
                } else {
                    Swal.fire({
                        title: '삭제 실패',
                        text: '문제가 발생했어요. 잠시 후 다시 시도해주세요.',
                        icon: 'error',
                        confirmButtonColor: '#F76B59',
                    });
                }
            }
        }
    };

    if (!ask) return null;

    // 수정/삭제 권한 체크: 작성자이거나 관리자인 경우
    const canModify = ask.owner || ask.isAdmin;

    return (
        <div className="main-layout">
            <div className="main-content-wrapper">
                <main className="main-content">
                    <h1 className="detail-title">{ask.title}</h1>

                    {/* 작성자 + 날짜 + 답변 상태 + 공유/조회수 */}
                    <div className="detail-meta">
                        <div className="meta-left">
                            <span className="detail-author">{ask.userName}</span>
                            <span className="detail-date">
                                {new Date(ask.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                })}
                            </span>
                            {/* 답변 상태 배지 */}
                            <span className={`status-badge ${ask.answered ? 'answered' : 'pending'}`}>
                                {ask.answered ? '답변 완료' : '답변 대기중'}
                            </span>
                        </div>
                        {/* 공유 + 조회수 */}
                        <div className="interaction-section">
                            <button className="share-btn" onClick={handleShare}>
                                <Share2 className="share-icon" size={16} color="#000" />
                                공유하기
                            </button>
                            {/* 조회수 추가 */}
                            <span className="detail-views">
                                <Eye className="view-icon" size={18} color="#000" />
                                {ask.viewCount || 0}
                            </span>
                        </div>
                    </div>

                    {/* 첨부파일 목록 (PDF, Excel 등 - 이미지 제외) */}
                    {attachments.length > 0 && (
                        <div className="detail-files">
                            <h3>첨부파일</h3>
                            <ul>
                                {attachments
                                    .filter(att => !['png','jpg','jpeg','gif'].includes(att.extension.toLowerCase()))
                                    .map(att => (
                                        <li key={att.askAttachmentId}>
                                            <a
                                                href={`/api/asks/${id}/attachments/${att.askAttachmentId}/download`}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    handleDownload(att.askAttachmentId, att.fileName);
                                                }}
                                            >
                                                📄 {att.fileName}
                                            </a>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}

                    {/* 본문 */}
                    <div
                        className="qna-detail-content"
                        dangerouslySetInnerHTML={{ __html: ask.content }}
                    ></div>

                    {/* 작성자이거나 관리자일 때만 버튼 보이기 */}
                    {canModify && (
                        <div className="qna-detail-crud-buttons">
                            <button className="qna-detail-edit-btn" onClick={handleEdit}>수정</button>
                            <button className="qna-detail-delete-btn" onClick={handleDelete}>삭제</button>
                        </div>
                    )}

                    <button className="qna-detail-back-btn" onClick={() => navigate('/community/qna')}>
                        목록으로
                    </button>

                    {/* 댓글 섹션 추가 - onCommentAdded 콜백 전달 */}
                    <div className="comment-wrapper">
                        <CommentSection
                            parentType="ASK"
                            parentId={id}
                            onCommentAdded={handleCommentAdded}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QnaDetail;