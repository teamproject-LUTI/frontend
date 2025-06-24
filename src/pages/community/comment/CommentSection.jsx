import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../../styles/community/comment/CommentSection.css';

const CommentSection = ({ parentType, parentId, onCommentAdded }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 댓글 목록 조회
    const fetchComments = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/comments/${parentType}/${parentId}`);
            const commentsData = response.data.data || [];

            // 디버깅 로그 추가
            console.log('댓글 데이터:', commentsData);
            if (commentsData.length > 0) {
                console.log('첫 번째 댓글:', commentsData[0]);
                console.log('isOwner 값:', commentsData[0].isOwner);
                console.log('userName 값:', commentsData[0].userName);
            }

            setComments(commentsData);
        } catch (error) {
            console.error('댓글 조회 실패:', error);
            await Swal.fire({
                title: '오류',
                text: '댓글을 불러오는데 실패했습니다.',
                icon: 'error',
                confirmButtonColor: '#F76B59'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트 마운트 시 댓글 조회
    useEffect(() => {
        if (parentType && parentId) {
            fetchComments();
        }
    }, [parentType, parentId]);

    // 댓글 등록
    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            await Swal.fire({
                title: '입력 오류',
                text: '댓글 내용을 입력해주세요.',
                icon: 'warning',
                confirmButtonColor: '#F76B59'
            });
            return;
        }

        try {
            // 댓글 등록 API 호출
            await axios.post(`/api/comments/${parentType}/${parentId}`, {
                content: newComment.trim()
            });

            setNewComment('');
            await fetchComments(); // 댓글 목록 새로고침

            // 부모 컴포넌트에 댓글 추가 알림 (문의글 답변 상태 업데이트용)
            if (onCommentAdded && typeof onCommentAdded === 'function') {
                console.log('onCommentAdded 콜백 호출');
                onCommentAdded();
            }

            await Swal.fire({
                title: '성공',
                text: '댓글이 등록되었습니다.',
                icon: 'success',
                confirmButtonColor: '#F76B59',
                timer: 1500
            });
        } catch (error) {
            console.error('댓글 등록 실패:', error);
            await Swal.fire({
                title: '등록 실패',
                text: '댓글 등록에 실패했습니다.',
                icon: 'error',
                confirmButtonColor: '#F76B59'
            });
        }
    };

    // 댓글 수정 시작
    const handleStartEdit = (comment) => {
        setEditingId(comment.commentId);
        setEditContent(comment.content);
    };

    // 댓글 수정 취소
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditContent('');
    };

    // 댓글 수정 완료
    const handleUpdateComment = async (commentId) => {
        if (!editContent.trim()) {
            await Swal.fire({
                title: '입력 오류',
                text: '댓글 내용을 입력해주세요.',
                icon: 'warning',
                confirmButtonColor: '#F76B59'
            });
            return;
        }

        try {
            await axios.patch(`/api/comments/${commentId}`, {
                content: editContent.trim()
            });

            setEditingId(null);
            setEditContent('');
            await fetchComments();

            await Swal.fire({
                title: '성공',
                text: '댓글이 수정되었습니다.',
                icon: 'success',
                confirmButtonColor: '#F76B59',
                timer: 1500
            });
        } catch (error) {
            console.error('댓글 수정 실패:', error);
            await Swal.fire({
                title: '수정 실패',
                text: '댓글 수정에 실패했습니다.',
                icon: 'error',
                confirmButtonColor: '#F76B59'
            });
        }
    };

    // 댓글 삭제
    const handleDeleteComment = async (commentId) => {
        const result = await Swal.fire({
            title: '댓글 삭제',
            text: '정말로 이 댓글을 삭제하시겠습니까?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#F76B59',
            cancelButtonColor: '#d3d3d3',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/comments/${commentId}`);
                await fetchComments();

                await Swal.fire({
                    title: '삭제 완료',
                    text: '댓글이 삭제되었습니다.',
                    icon: 'success',
                    confirmButtonColor: '#F76B59',
                    timer: 1500
                });
            } catch (error) {
                console.error('댓글 삭제 실패:', error);
                await Swal.fire({
                    title: '삭제 실패',
                    text: '댓글 삭제에 실패했습니다.',
                    icon: 'error',
                    confirmButtonColor: '#F76B59'
                });
            }
        }
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR');
        }
    };

    return (
        <div className="comment-section">
            <h3 className="comment-title">
                댓글 ({comments.length})
            </h3>

            {/* 댓글 작성 폼 */}
            <form onSubmit={handleSubmitComment} className="comment-form">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 입력하세요..."
                    className="comment-textarea"
                    rows={3}
                />
                <div className="comment-form-actions">
                    <button
                        type="submit"
                        className="comment-submit-btn"
                        disabled={!newComment.trim()}
                    >
                        댓글 등록
                    </button>
                </div>
            </form>

            {/* 댓글 목록 */}
            <div className="comment-list">
                {isLoading ? (
                    <div className="comment-loading">댓글을 불러오는 중...</div>
                ) : comments.length === 0 ? (
                    <div className="comment-empty">아직 댓글이 없습니다.</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.commentId} className="comment-item">
                            <div className="comment-header">
                                <div className="comment-meta">
                                    <span className="comment-author">{comment.userName || '작성자'}</span>
                                    <span className="comment-date">
                                        {formatDate(comment.createdAt)}
                                    </span>
                                </div>
                                {/* 소유자인 경우에만 수정/삭제 버튼 표시 */}
                                {comment.isOwner && (
                                    <div className="comment-actions">
                                        {editingId === comment.commentId ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateComment(comment.commentId)}
                                                    className="comment-action-btn save"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="comment-action-btn cancel"
                                                >
                                                    취소
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleStartEdit(comment)}
                                                    className="comment-action-btn edit"
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(comment.commentId)}
                                                    className="comment-action-btn delete"
                                                >
                                                    삭제
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="comment-content">
                                {editingId === comment.commentId ? (
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="comment-edit-textarea"
                                        rows={3}
                                    />
                                ) : (
                                    <p>{comment.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;