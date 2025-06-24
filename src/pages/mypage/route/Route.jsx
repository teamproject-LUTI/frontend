import React, { useState, useEffect } from 'react';
import { Heart, Trash2, MapPin, Calendar, Users, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import '../../../styles/MyPage/Route.css';

const Route = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRoute, setExpandedRoute] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    // 즐겨찾기 루트 목록 조회
    const fetchRoutes = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${API_BASE_URL}/api/routes`, {
                withCredentials: true
            });

            if (response.data.success) {
                setRoutes(response.data.routes);
            } else {
                throw new Error(response.data.message || '루트 조회에 실패했습니다.');
            }
        } catch (error) {
            console.error('루트 조회 실패:', error);
            setError(error.response?.data?.message || '루트를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 루트 삭제
    const deleteRoute = async (routeId) => {
        if (!window.confirm('정말로 이 루트를 삭제하시겠습니까?')) {
            return;
        }

        try {
            const response = await axios.delete(`${API_BASE_URL}/api/routes/${routeId}`, {
                withCredentials: true
            });

            if (response.data.success) {
                // 성공적으로 삭제되면 목록에서 제거
                setRoutes(routes.filter(route => route.routeId !== routeId));
                alert('루트가 삭제되었습니다.');
            } else {
                throw new Error(response.data.message || '루트 삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('루트 삭제 실패:', error);
            alert(error.response?.data?.message || '루트 삭제에 실패했습니다.');
        }
    };

    // 루트 상세보기 토글
    const toggleRouteDetail = (routeId) => {
        setExpandedRoute(expandedRoute === routeId ? null : routeId);
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    // 루트 내용 파싱
    const parseRouteContent = (routeContent) => {
        try {
            return JSON.parse(routeContent);
        } catch (error) {
            console.error('루트 내용 파싱 실패:', error);
            return null;
        }
    };

    // 루트 카드 컴포넌트
    const RouteCard = ({ route }) => {
        const routeData = parseRouteContent(route.routeContent);
        const isExpanded = expandedRoute === route.routeId;

        return (
            <div className="route-card">
                <div className="route-header">
                    <h3 className="route-title">
                        <Heart className="heart-icon" />
                        {route.routeTitle}
                    </h3>
                    <div className="route-actions">
                        <button
                            className="detail-btn"
                            onClick={() => toggleRouteDetail(route.routeId)}
                        >
                            {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
                            {isExpanded ? '숨기기' : '상세보기'}
                        </button>
                        <button
                            className="delete-btn"
                            onClick={() => deleteRoute(route.routeId)}
                        >
                            <Trash2 size={16} />
                            삭제
                        </button>
                    </div>
                </div>

                {routeData && (
                    <div className="route-basic-info">
                        {routeData.searchInfo && (
                            <div className="search-info">
                                <div className="info-item">
                                    <MapPin size={16} />
                                    <span>{routeData.searchInfo.cityCode}</span>
                                </div>
                                <div className="info-item">
                                    <Calendar size={16} />
                                    <span>
                                        {routeData.searchInfo.checkInDate} ~ {routeData.searchInfo.checkOutDate}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <Users size={16} />
                                    <span>성인 {routeData.searchInfo.adults}명</span>
                                </div>
                            </div>
                        )}

                        {routeData.selectedPackage && (
                            <div className="package-summary">
                                <div className="package-info">
                                    <span className="package-theme">{routeData.selectedPackage.theme}</span>
                                    <span className="package-price">{routeData.selectedPackage.totalPrice} {routeData.selectedPackage.currency}</span>
                                </div>
                                {routeData.selectedPackage.hotel && (
                                    <div className="hotel-info">
                                        🏨 {routeData.selectedPackage.hotel.name} ({routeData.selectedPackage.hotel.category})
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {isExpanded && routeData && routeData.selectedPackage && (
                    <div className="route-detail">
                        {/* 호텔 상세 정보 */}
                        {routeData.selectedPackage.hotel && (
                            <div className="hotel-detail">
                                <h4>🏨 숙박 정보</h4>
                                <div className="hotel-card">
                                    <div className="hotel-name">{routeData.selectedPackage.hotel.name}</div>
                                    <div className="hotel-meta">
                                        {routeData.selectedPackage.hotel.category} • {routeData.selectedPackage.hotel.location}
                                    </div>
                                    <div className="hotel-price">{routeData.selectedPackage.hotel.pricePerNight}/박</div>
                                    {routeData.selectedPackage.hotel.amenities && (
                                        <div className="hotel-amenities">
                                            <strong>편의시설:</strong> {routeData.selectedPackage.hotel.amenities.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 여행 일정 */}
                        {routeData.selectedPackage.itinerary && (
                            <div className="itinerary-detail">
                                <h4>📅 여행 일정</h4>
                                {routeData.selectedPackage.itinerary.map((day, index) => (
                                    <div key={index} className="day-schedule">
                                        <div className="day-header">
                                            <span className="day-number">Day {day.day}</span>
                                            <span className="day-title">{day.title}</span>
                                            <span className="day-date">{day.date}</span>
                                        </div>
                                        {day.activities && day.activities.map((activity, actIndex) => (
                                            <div key={actIndex} className="activity-item">
                                                <div className="activity-time">{activity.time}</div>
                                                <div className="activity-content">
                                                    <div className="activity-name">{activity.activity}</div>
                                                    <div className="activity-location">📍 {activity.location}</div>
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

                        {/* 하이라이트 */}
                        {routeData.selectedPackage.highlights && (
                            <div className="highlights-section">
                                <h4>✨ 여행 특징</h4>
                                <div className="highlights-list">
                                    {routeData.selectedPackage.highlights.map((highlight, index) => (
                                        <span key={index} className="highlight-tag">{highlight}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 포함사항 */}
                        {routeData.selectedPackage.included && (
                            <div className="included-section">
                                <h4>✅ 포함사항</h4>
                                <div className="included-list">
                                    {routeData.selectedPackage.included.join(' • ')}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
                <div className="route-container">
                    <div className="loading-section">
                        <div className="loading-spinner"></div>
                        <p>즐겨찾기 루트를 불러오는 중...</p>
                    </div>
                </div>
        );
    }

    return (
            <div className="route-container">
                <div className="route-header">
                    <h1>🧡 즐겨찾기 루트</h1>
                    <p>저장한 여행 루트를 확인하고 관리하세요</p>
                </div>

                {error && (
                    <div className="error-section">
                        <p className="error-message">⚠️ {error}</p>
                        <button onClick={fetchRoutes} className="retry-button">
                            다시 시도
                        </button>
                    </div>
                )}

                <div className="route-content">
                    {routes.length === 0 ? (
                        <div className="empty-state">
                            <Heart size={64} className="empty-icon" />
                            <h3>저장된 루트가 없습니다</h3>
                            <p>여행 계획에서 마음에 드는 루트를 즐겨찾기에 추가해보세요!</p>
                            <button
                                className="go-chat-btn"
                                onClick={() => window.location.href = '/travel/chatform'}
                            >
                                여행 계획하러 가기
                            </button>
                        </div>
                    ) : (
                        <div className="route-list">
                            {routes.map(route => (
                                <RouteCard key={route.routeId} route={route} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
    );
};

export default Route;