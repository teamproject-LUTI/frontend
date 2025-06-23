import React, { useEffect, useState, useRef } from 'react';
import { Eye, Share2  } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/review/ReviewDetail.css';
import LikeButton from '../../../components/community/review/LikeButton';

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [attachments, setAttachments] = useState([]);
    // 로컬스토리지에 저장된 JWT 가져오기
    const token = localStorage.getItem('accessToken');
    // 마운트 시 fetchReview가 한 번만 실행되도록 제어하는 ref 플래그
    const hasFetched = useRef(false);

    useEffect(() => {

        if (hasFetched.current) return;  // 이미 fetchReview가 실행된 적이 있으면 더 이상 실행하지 않음
        hasFetched.current = true;       // 최초 실행 시 플래그를 true로 설정하여 이후엔 스킵하게 만듦


        const fetchReview = async () => {
            try {
                const res = await axios.get(`/api/reviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }   // 인증 헤더 추가
                });
                const dto = res.data.data;
                setReview(dto);
            } catch (err) {
                console.error('리뷰 조회 실패', err);
            }
        };
        fetchReview();
    }, [id, token]);

    // 2) 첨부파일만 가져오는 useEffect 추가
    useEffect(() => {
        const fetchAttachments = async () => {
            try {
                const res = await axios.get(`/api/reviews/${id}/attachments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAttachments(res.data.data || []);
            } catch (err) {
                console.error('첨부파일 조회 실패', err);
            }
        };
        fetchAttachments();
    }, [id, token]);

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
        navigate(`/community/review/edit/${id}`);
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
                await axios.delete(`/api/reviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                await Swal.fire({
                    title: '삭제 완료!',
                    text: '글이 삭제되었어요.',
                    icon: 'success',
                    confirmButtonColor: '#F76B59',
                });
                navigate('/community/review');
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
    if (!review) return null;

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <h1 className="detail-title">{review.title}</h1>

                    {/* 작성자+날짜 · 공유+좋아요 */}
                    <div className="detail-meta">
                        <div className="meta-left">
                            <span className="detail-author">{review.userName}</span>
                            <span className="detail-date">
                                {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                })}
                        </span>
                        </div>
                        {/* 공유 + 조회수 + 좋아요 */}
                        <div className="interaction-section">
                            <button className="share-btn" onClick={handleShare}>
                                <Share2 className="share-icon" size={16} color="#000" />
                                공유하기
                            </button>
                            {/* 조회수 추가 */}
                            <span className="detail-views">
                                <Eye className="view-icon" size={18} color="#000" />
                                {review.viewCount}
                            </span>
                            <LikeButton
                                initialLiked={review.liked}
                                initialCount={review.likeCount}
                            />
                        </div>
                    </div>

                    {/* 첨부 이미지 갤러리 */}
                    {attachments.length > 0 && (
                        <div className="detail-images">
                            {attachments.map(att => (
                                <img
                                    key={att.reviewAttachmentId}
                                    src={att.logicalPath}      // 서버에 매핑된 URL (/uploads/UUID.jpg)
                                    alt={att.fileName}
                                    className="detail-image"
                                />
                            ))}
                        </div>
                    )}
                    <div
                        className="detail-content"
                        dangerouslySetInnerHTML={{ __html: review.content }}
                    ></div>
                    {/*내가 쓴 글일 때만 버튼 보이기 */}
                    {review.owner && (
                        <div className="review-list-crud-buttons">
                            <button className="review-list-edit-btn" onClick={handleEdit}>수정</button>
                            <button className="review-list-delete-btn" onClick={handleDelete}>삭제</button>
                        </div>
                    )}
                    <button className="review-list-back-btn" onClick={() => navigate('/community/review')}>
                        목록으로
                    </button>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ReviewDetail;
