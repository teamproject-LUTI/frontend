import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        // 문의글 조회 API 호출
        const fetchQna = async () => {
            try {
                const res = await axios.get(`/api/asks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dto = res.data.data;
                setAsk(dto);
            } catch (err) {
                console.error('문의글 조회 실패', err);
            }
        };
        fetchQna();
    }, [id, token]);

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
                Swal.fire({
                    title: '삭제 실패',
                    text: '문제가 발생했어요. 잠시 후 다시 시도해주세요.',
                    icon: 'error',
                    confirmButtonColor: '#F76B59',
                });
            }
        }
    };

    if (!ask) return null;

    return (
        <div className="main-layout">
            <div className="main-content-wrapper">
                <main className="main-content">
                    <h1 className="detail-title">{ask.title}</h1>

                    {/* 작성자 + 날짜 */}
                    <div className="detail-meta">
                        <span className="detail-author">{ask.userName}</span>
                        <span className="detail-date">
                            {new Date(ask.createdAt).toLocaleDateString('ko-KR', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            })}
                        </span>
                        {/* 공유 버튼 */}
                        <div className="interaction-section">
                            <button className="share-btn" onClick={handleShare}>
                                공유하기
                            </button>
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

                    {/* 첨부 이미지 갤러리 */}
                    {attachments.filter(att => ['png','jpg','jpeg','gif'].includes(att.extension.toLowerCase())).length > 0 && (
                        <div className="detail-images">
                            {attachments
                                .filter(att => ['png','jpg','jpeg','gif'].includes(att.extension.toLowerCase()))
                                .map(att => (
                                    <img
                                        key={att.askAttachmentId}
                                        src={att.logicalPath}
                                        alt={att.fileName}
                                        className="detail-image"
                                    />
                                ))}
                        </div>
                    )}

                    <div
                        className="detail-content"
                        dangerouslySetInnerHTML={{ __html: ask.content }}
                    ></div>

                    {/* 내가 쓴 글일 때만 버튼 보이기 */}
                    {ask.owner && (
                        <div className="crud-buttons">
                            <button className="edit-btn" onClick={handleEdit}>수정</button>
                            <button className="delete-btn" onClick={handleDelete}>삭제</button>
                        </div>
                    )}

                    <button className="back-btn" onClick={() => navigate('/community/qna')}>
                        목록으로
                    </button>

                    {/* 댓글 섹션 추가 */}
                    <CommentSection
                        parentType="ASK"
                        parentId={id}
                    />
                </main>
            </div>
        </div>
    );
};

export default QnaDetail;