import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, PenTool, Eye, EyeOff, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/MyPage/TravelRecord.css';

const TravelHistory = () => {
    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedHistory, setExpandedHistory] = useState(null);
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    // 여행 기록 목록 조회
    const fetchTravelHistories = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${API_BASE_URL}/api/travel-history`, {
                withCredentials: true
            });

            if (response.data.success) {
                setHistories(response.data.histories);
            } else {
                throw new Error(response.data.message || '여행 기록 조회에 실패했습니다.');
            }
        } catch (error) {
            console.error('여행 기록 조회 실패:', error);
            setError(error.response?.data?.message || '여행 기록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 여행 기록 상세보기 토글
    const toggleHistoryDetail = (travelRecordId) => {
        setExpandedHistory(expandedHistory === travelRecordId ? null : travelRecordId);
    };

    // 리뷰 작성하기
    const writeReview = (history) => {
        const historyData = parseHistoryContent(history.travelContent);

        // ✅ 개인정보 제외하고 리뷰 작성용 데이터만 전달
        const reviewData = {
            ...historyData
        };

        // ✅ 개인정보 섹션 제거
        if (reviewData.privateInfo) {
            delete reviewData.privateInfo;
        }

        // 리뷰 작성 페이지로 이동하면서 여행 정보 전달 (개인정보 제외)
        navigate('/community/review/write', {
            state: {
                travelInfo: {
                    title: history.travelTitle,
                    location: historyData?.searchInfo?.cityCode || '',
                    checkInDate: historyData?.searchInfo?.checkInDate || '',
                    checkOutDate: historyData?.searchInfo?.checkOutDate || '',
                    hotelName: historyData?.selectedPackage?.hotel?.name || '',
                    hotelCategory: historyData?.selectedPackage?.hotel?.category || '',
                    roomType: historyData?.selectedPackage?.hotel?.roomType || '',
                    adults: historyData?.searchInfo?.adults || 1,
                    nights: historyData?.searchInfo?.nights || 1,
                    completedAt: historyData?.selectedPackage?.completedAt || '',
                    // ❌ 개인정보는 전달하지 않음 (name, phone, email, payment 정보 등)
                },
                // ✅ 공개 가능한 여행 데이터만 전달
                travelData: reviewData
            }
        });
    };

    useEffect(() => {
        fetchTravelHistories();
    }, []);

    // 여행 기록 내용 파싱
    const parseHistoryContent = (historyContent) => {
        try {
            return JSON.parse(historyContent);
        } catch (error) {
            console.error('여행 기록 내용 파싱 실패:', error);
            return null;
        }
    };

    // 여행 기록 카드 컴포넌트
    const TravelHistoryCard = ({ history }) => {
        const historyData = parseHistoryContent(history.travelContent);
        const isExpanded = expandedHistory === history.travelRecordId;

        return (
            <div className="travel-history-card">
                <div className="history-header">
                    <h3 className="history-title">
                        <Plane className="travel-icon" />
                        {history.travelTitle}
                    </h3>
                    <div className="history-actions">
                        <button
                            className="detail-btn"
                            onClick={() => toggleHistoryDetail(history.travelRecordId)}
                        >
                            {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                            {isExpanded ? '숨기기' : '상세보기'}
                        </button>
                        <button
                            className="review-btn"
                            onClick={() => writeReview(history)}
                        >
                            <PenTool size={16} />
                            리뷰 쓰기
                        </button>
                    </div>
                </div>

                {historyData && (
                    <div className="history-basic-info">
                        {historyData.searchInfo && (
                            <div className="search-info">
                                <div className="info-item">
                                    <MapPin size={16} />
                                    <span>{historyData.searchInfo.cityCode}</span>
                                </div>
                                <div className="info-item">
                                    <Calendar size={16} />
                                    <span>
                                        {historyData.searchInfo.checkInDate} ~ {historyData.searchInfo.checkOutDate}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <Users size={16} />
                                    <span>성인 {historyData.searchInfo.adults}명</span>
                                </div>
                            </div>
                        )}

                        {historyData.selectedPackage && (
                            <div className="package-summary">
                                <div className="package-info">
                                    <span className="package-theme">{historyData.selectedPackage.theme}</span>
                                    <span className="package-price">
                                        {historyData.selectedPackage.totalPrice?.toLocaleString()} {historyData.selectedPackage.currency}
                                    </span>
                                </div>
                                {historyData.selectedPackage.hotel && (
                                    <div className="hotel-info">
                                        🏨 {historyData.selectedPackage.hotel.name} ({historyData.selectedPackage.hotel.category})
                                    </div>
                                )}
                                {historyData.selectedPackage.completedAt && (
                                    <div className="completed-date">
                                        ✅ 여행 완료: {new Date(historyData.selectedPackage.completedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {isExpanded && historyData && historyData.selectedPackage && (
                    <div className="history-detail">
                        {/* 호텔 상세 정보 (간략화) */}
                        {historyData.selectedPackage.hotel && (
                            <div className="hotel-detail">
                                <h4>🏨 숙박 정보</h4>
                                <div className="hotel-card">
                                    <div className="hotel-name">{historyData.selectedPackage.hotel.name}</div>
                                    <div className="hotel-meta">
                                        {historyData.selectedPackage.hotel.category} • {historyData.selectedPackage.hotel.location}
                                    </div>
                                    <div className="hotel-price">{historyData.selectedPackage.hotel.pricePerNight}/박</div>
                                </div>
                            </div>
                        )}

                        {/* ✅ 여행 일정 추가 (Route.jsx와 동일한 구조) */}
                        {historyData.selectedPackage.itinerary && historyData.selectedPackage.itinerary.length > 0 && (
                            <div className="itinerary-detail">
                                <h4>📅 여행 일정</h4>
                                {historyData.selectedPackage.itinerary
                                    .filter(day => day && day.activities && day.activities.length > 0) // 유효한 day만 필터링
                                    .map((day, index) => (
                                        <div key={day.day || index} className="day-schedule">
                                            <div className="day-header">
                                                <span className="day-number">Day {day.day || (index + 1)}</span>
                                                <span className="day-title">{day.title || ''}</span>
                                                <span className="day-date">{day.date || ''}</span>
                                            </div>
                                            {day.activities && day.activities.map((activity, actIndex) => (
                                                <div key={actIndex} className="activity-item">
                                                    <div className="activity-time">{activity.time || ''}</div>
                                                    <div className="activity-content">
                                                        <div className="activity-name">{activity.activity || ''}</div>
                                                        <div className="activity-location">📍 {activity.location || ''}</div>
                                                        {activity.description && (
                                                            <div className="activity-description">{activity.description}</div>
                                                        )}
                                                        {activity.included && (
                                                            <span className="activity-included">✅ 포함</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* ✅ 하이라이트 추가 */}
                        {historyData.selectedPackage.highlights && (
                            <div className="highlights-section">
                                <h4>✨ 여행 특징</h4>
                                <div className="highlights-list">
                                    {historyData.selectedPackage.highlights.map((highlight, index) => (
                                        <span key={index} className="highlight-tag">{highlight}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 결제 정보 */}
                        {history.paymentId && (
                            <div className="payment-info">
                                <h4>💳 결제 정보</h4>
                                <p>결제 ID: {history.paymentId}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="travel-history-container">
                <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p>여행 기록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="travel-history-container">
            <div className="travel-history-header">
                <h1>✈️ 여행 기록</h1>
                <p>다녀온 여행의 소중한 추억을 기록하고 후기를 작성해보세요</p>
            </div>

            {error && (
                <div className="error-section">
                    <p className="error-message">⚠️ {error}</p>
                    <button onClick={fetchTravelHistories} className="retry-button">
                        다시 시도
                    </button>
                </div>
            )}

            <div className="travel-history-content">
                {histories.length === 0 ? (
                    <div className="empty-state">
                        <Plane size={64} className="empty-icon" />
                        <h3>아직 다녀온 여행이 없습니다</h3>
                        <p>여행을 예약하고 다녀오신 후 이곳에서 소중한 추억을 기록해보세요!</p>
                        <button
                            className="go-travel-btn"
                            onClick={() => window.location.href = '/travel/chatform'}
                        >
                            여행 계획하러 가기
                        </button>
                    </div>
                ) : (
                    <div className="travel-history-list">
                        {histories.map(history => (
                            <TravelHistoryCard key={history.travelRecordId} history={history} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TravelHistory;