import React, {useEffect, useState} from 'react';
import {Search, MapPin, Calendar, Users, Loader2, Send} from "lucide-react";
import '../../styles/chatgpt/ChatForm.css';

/* ────────── 추천 여행 루트 카드 ────────── */
const TravelRouteCard = ({route, isSelected, onSelect, loading, searchInfo}) => {

    // 당일치기 여행 여부 확인 - 더 정확한 판단 로직
    const isDayTrip =
        // 1. 제목에 당일치기 키워드가 있는 경우
        route.title?.toLowerCase().includes('당일치기') ||
        route.title?.toLowerCase().includes('데이트리') ||
        route.title?.toLowerCase().includes('일일') ||
        route.title?.toLowerCase().includes('하루') ||
        // 2. 호텔 정보가 없는 경우
        !route.hotel ||
        // 3. 체크인/체크아웃 날짜가 같은 경우 (searchInfo에서 확인)
        (searchInfo &&
            searchInfo.checkInDate === searchInfo.checkOutDate) ||
        // 4. 일정이 1일만 있고 호텔이 없는 경우
        (route.itinerary && route.itinerary.length === 1 && !route.hotel);

    // 유효한 일정만 필터링(activities가 있고 비어있지 않은 것만)
    const validItinerary = route.itinerary?.filter(day =>
        day.activities && day.activities.length > 0
    ) || [];

    return (
        <div
            className={`route-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(route)}
        >
            {/* 루트 헤더 */}
            <div className="route-header">
                <h3 className="route-title">{route.title}</h3>
                <div className="route-price-info">
                    {/* 총 예상 비용 */}
                    <div className="route-price">
                        <span className="price-label">총 예상 여행비용 : </span>
                        <span className="total-budget">💰 {route.totalPrice}{route.currency}</span>
                    </div>

                    {/* 실제 결제 금액 (숙박비만) - 당일치기가 아닌 경우만 */}
                    {!isDayTrip && route.hotel && (
                        <div className="actual-payment">
                            <span className="payment-label">LUTI에서 결제금액(숙박비) : </span>
                            <span className="payment-amount">🏨 {route.hotel.pricePerNight} KRW</span>
                        </div>
                    )}

                    <div className="route-meta">
                        {route.priceRange} • {route.theme}
                        {isDayTrip && <span className="day-trip-badge">당일치기</span>}
                    </div>
                </div>
            </div>

            {/* 호텔 정보 - 당일치기가 아닌 경우만 표시 */}
            {!isDayTrip && route.hotel && (
                <div className="route-hotel-info">
                    <h4 className="hotel-name">🏨 {route.hotel?.name}</h4>
                    <div className="hotel-details">
                        {route.hotel?.category} • {route.hotel?.location}
                    </div>
                    <div className="hotel-price-per-night">
                        {route.hotel?.pricePerNight}/박
                    </div>
                </div>
            )}

            {/* 여행 일정 상세 */}
            {validItinerary.length > 0 && (
                <div className="route-itinerary">
                    <h4 className="itinerary-title">
                        📅 {isDayTrip ? '당일 여행 일정' : '추천 여행 루트'}
                    </h4>
                    {validItinerary.map((day, dayIndex) => (
                        <div key={dayIndex} className="itinerary-day">
                            <div className="day-title">
                                {isDayTrip ? day.title || '당일 일정' : `Day ${day.day}: ${day.title}`}
                            </div>
                            {day.date && <div className="day-date">{day.date}</div>}
                            {day.activities && day.activities.map((activity, actIndex) => (
                                <div key={actIndex} className="day-activity">
                                    <div className="activity-time">{activity.time}</div>
                                    <div className="activity-content">
                                        <span className="activity-name">{activity.activity}</span>
                                        <span className="activity-location">📍 {activity.location}</span>
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

            {/* 루트 하이라이트 */}
            {route.highlights && route.highlights.length > 0 && (
                <div className="route-highlights">
                    <h4 className="highlights-title">✨ 여행 특징</h4>
                    <div className="highlights-tags">
                        {route.highlights.map((highlight, hIndex) => (
                            <span key={hIndex} className="highlight-tag">
                            {highlight}
                        </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 포함사항 */}
            {route.included && route.included.length > 0 && (
                <div className="route-included">
                    <h4 className="included-title">✅ 포함사항</h4>
                    <div className="included-items">
                        {route.included.join(' • ')}
                    </div>
                </div>
            )}

            {/* 추천 대상 */}
            {route.bestFor && (
                <div className="route-best-for">
                    👥 추천: {route.bestFor}
                </div>
            )}

            {/* 선택 버튼 */}
            <button
                className={`select-route-btn ${isSelected ? 'selected' : ''}`}
                disabled={loading}
            >
                {isSelected ? '✓ 선택됨' : '이 루트로 여행떠나기🐾'}
            </button>
        </div>
    )
};



/* ────────── 메시지 컴포넌트 ────────── */
const ChatMessage = ({type, content, searchInfo, routes, onSelectRoute, selectedRoute, loading}) => {
    if (type === 'user') {
        return (
            <div className="chat-message user-message">
                <div className="message-content">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="chat-message bot-message">
            <div className="bot-avatar">
            </div>
            <div className="message-content">
                <div className="bot-response">
                    <h3 className="response-title">여행 루트를 찾았어요! 냥❣️ </h3>
                    <p className="response-subtitle">맞춤형 여행 루트를 확인해보세요 ️</p>

                    {/* 검색 정보 */}
                    {searchInfo && (
                        <div className="search-info">
                            <div className="search-info-item">
                                <MapPin className="info-icon"/>
                                <span>목적지: {searchInfo.cityCode}</span>
                            </div>
                            <div className="search-info-item">
                                <Calendar className="info-icon"/>
                                <span>{searchInfo.checkInDate} ~ {searchInfo.checkOutDate}</span>
                            </div>
                            <div className="search-info-item">
                                <Users className="info-icon"/>
                                <span>성인 {searchInfo.adults}명</span>
                            </div>
                        </div>
                    )}

                    {/* 추천 여행 루트 목록 */}
                    {routes && routes.length > 0 && (
                        <div className="routes-section">
                            <h4 className="routes-title">
                                🗺️ 추천 여행 루트 ({routes.length}개 옵션)
                            </h4>
                            <div className="routes-grid">
                                {routes.map((route, index) => (
                                    <TravelRouteCard
                                        key={route.packageId || index}
                                        route={route}
                                        isSelected={selectedRoute?.packageId === route.packageId}
                                        onSelect={onSelectRoute}
                                        loading={loading}
                                        searchInfo={searchInfo}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 선택된 루트 다음 단계 */}
                    {selectedRoute && (
                        <div className="selected-route-section">
                            <h4 className="selected-title">
                                ✅ {selectedRoute.title} 루트가 선택되었습니다!
                            </h4>
                            <p className="selected-description">
                                하단의 버튼으로 즐겨찾기 저장 또는 예약을 진행하면 돼요, 냥❣️
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ────────── 메인 컴포넌트 ────────── */
const ChatForm = () => {
    // 상태
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentRoutes, setCurrentRoutes] = useState([]);
    const [currentSearchInfo, setCurrentSearchInfo] = useState(null);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    // 즐겨찾기 저장 처리
    const saveToFavorites = async (selectedRoute) => {
        if (loading) return;

        setLoading(true);

        try {
            const saveData = {
                routeTitle: selectedRoute.title,
                routeContent: {
                    searchInfo: currentSearchInfo,
                    selectedPackage: selectedRoute,
                    savedAt: new Date().toISOString()
                }
            };

            const res = await fetch('http://localhost:8080/api/routes/save', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify(saveData),
            });

            if (!res.ok) {
                throw new Error(`서버 오류: ${res.status}`);
            }

            const data = await res.json();

            if (data.success) {
                alert('💖 즐겨찾기에 저장되었습니다!');
                console.log('즐겨찾기 저장 완료:', data);
            } else {
                throw new Error(data.message || '즐겨찾기 저장에 실패했습니다.');
            }

        } catch (error) {
            console.error('즐겨찾기 저장 실패:', error);
            alert('즐겨찾기 저장 중 오류가 발생했습니다: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // 숙소 예약 처리
    const bookHotel = async (selectedRoute) => {
        if (loading) return;

        // 당일치기 여행인지 확인
        const isDayTrip = !selectedRoute.hotel ||
            (currentSearchInfo && currentSearchInfo.checkInDate === currentSearchInfo.checkOutDate);

        if (isDayTrip) {
            alert('당일치기 여행은 숙소 예약이 필요하지 않습니다! 😊');
            return;
        }

        if (!selectedRoute.hotel) {
            alert('선택된 루트에 호텔 정보가 없습니다.');
            return;
        }

        // 실제 예약 로직은 나중에 구현
        alert(`🏨 ${selectedRoute.hotel.name} 예약 페이지로 이동합니다!\n(숙소 예약 기능 구현 예정)`);

        // TODO: 실제 호텔 예약 API 호출
        console.log('호텔 예약 데이터:', {
            hotel: selectedRoute.hotel,
            searchInfo: currentSearchInfo,
            selectedRoute: selectedRoute
        });
    };

    // 추천 여행 루트 생성
    const generateTravelRoutes = async () => {
        if (!prompt.trim()) {
            setError('여행 계획을 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');
        setSelectedRoute(null);

        // 사용자 메시지 추가
        const userMessage = {
            type: 'user',
            content: prompt,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setHasSearched(true);

        try {
            const res = await fetch('http://localhost:8080/chat/travel-packages', {
                method: 'POST',
                headers: {'Content-Type': 'text/plain; charset=utf-8'},
                credentials: 'include',
                body: prompt,
            });

            if (!res.ok) {
                throw new Error(`서버 오류: ${res.status}`);
            }

            const data = await res.json();

            if (data.success && data.packages) {
                setCurrentRoutes(data.packages);
                setCurrentSearchInfo(data.searchInfo);

                // 봇 응답 메시지 추가
                const botMessage = {
                    type: 'bot',
                    content: '여행 루트를 찾았습니다!',
                    routes: data.packages,
                    searchInfo: data.searchInfo,
                    timestamp: new Date().toISOString()
                };

                setMessages(prev => [...prev, botMessage]);
                console.log('생성된 여행 루트:', data.packages);
            } else {
                throw new Error('여행 루트 생성에 실패했습니다.');
            }

        } catch (error) {
            console.error('여행 루트 생성 실패:', error);
            setError('여행 루트 생성 중 오류가 발생했습니다: ' + error.message);
        } finally {
            setLoading(false);
            setPrompt(''); // 입력창 초기화
        }
    };

    // 루트 선택 처리
    const selectRoute = async (selectedRoute) => {
        if (loading) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('http://localhost:8080/chat/select-package', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    packageId: selectedRoute.packageId,
                    searchInfo: currentSearchInfo,
                    selectedPackage: selectedRoute,
                    userNotes: null
                }),
            });

            if (!res.ok) {
                throw new Error(`서버 오류: ${res.status}`);
            }

            const data = await res.json();

            if (data.success) {
                setSelectedRoute(selectedRoute);
                console.log('여행 루트 선택 완료:', data);
            } else {
                throw new Error('여행 루트 선택에 실패했습니다.');
            }

        } catch (error) {
            console.error('여행 루트 선택 실패:', error);
            setError('여행 루트 선택 중 오류가 발생했습니다: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('selectedRoute changed:', selectedRoute);
    }, [selectedRoute]);

    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();
        await generateTravelRoutes();
    };

    // 새로운 검색 시작
    const startNewSearch = () => {
        setMessages([]);
        setCurrentRoutes([]);
        setCurrentSearchInfo(null);
        setSelectedRoute(null);
        setHasSearched(false);
        setError('');
        setPrompt('');
    };

    return (
        <div className="chat-form">
            {!hasSearched ? (
                /* ────────── 초기 화면 ────────── */
                <div className="initial-screen">
                    <div className="welcome-section">
                        <h1 className="welcome-title">어디로 여행을 떠날까요?</h1>
                        <p className="welcome-subtitle"><strong>LUTI</strong> 가 맞춤형 여행 루트를 추천해드릴게요🎵 <strong>냥❣️</strong>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="initial-search-form">
                        <div className="initial-search-container">
                            <Search className="search-icon"/>
                            <input
                                type="text"
                                placeholder="예: 제주도 2박3일 힐링여행, 파리 1주일"
                                className="initial-search-input"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                className="initial-search-btn"
                                disabled={loading || !prompt.trim()}
                            >
                                {loading ? <Loader2 className="loading-icon"/> : '검색'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                /* ────────── 대화 화면 ────────── */
                <div className="chat-screen">
                    {/* 상단 헤더 */}
                    <div className="chat-header">
                        <div className="chat-title">
                            <div className="bot-avatar">
                                {/* span 태그 자체를 삭제 */}
                            </div>
                            <span>LUTI</span>
                        </div>

                        <button
                            className="new-search-btn"
                            onClick={startNewSearch}
                        >
                            새로운 검색하기
                        </button>
                    </div>

                    {/* 메시지 목록 */}
                    <div className="chat-messages">
                        {messages.map((message, index) => (
                            <ChatMessage
                                key={index}
                                type={message.type}
                                content={message.content}
                                searchInfo={message.searchInfo}
                                routes={message.routes}
                                onSelectRoute={selectRoute}
                                selectedRoute={selectedRoute}
                                loading={loading}
                            />
                        ))}

                        {loading && (
                            <div className="chat-message bot-message">
                                <div className="bot-avatar">

                                </div>
                                <div className="message-content">
                                    <div className="loading-container">
                                        <Loader2 className="loading-spinner"/>
                                        <div className="loading-text">
                                            <strong>LUTI</strong>가 맞춤형 여행 루트를 생성하고 있습니다🎵 <strong>❣️냥냥❣️</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 하단 입력창 */}
                    <div>
                        {/* 👇 플로팅 버튼들 - selectedRoute가 있을 때만 표시 */}
                        {selectedRoute && (
                            <div className="floating-booking-btns">
                                <button
                                    className="floating-favorite-btn"
                                    onClick={() => saveToFavorites(selectedRoute)}
                                    disabled={loading}
                                >
                                    💖 즐겨찾기
                                </button>
                                <button
                                    className="floating-book-btn"
                                    onClick={() => bookHotel(selectedRoute)}
                                    disabled={loading}
                                >
                                    🏨 숙소 예약하기
                                </button>
                            </div>
                        )}

                        <div className="chat-input-container">
                            <form onSubmit={handleSubmit} className="chat-input-form">
                                <input
                                    type="text"
                                    placeholder="추가 요청사항이 있으시면 입력해주세요..."
                                    className="chat-input"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    className="chat-send-btn"
                                    disabled={loading || !prompt.trim()}
                                >
                                    {loading ? <Loader2 className="loading-icon"/> : <Send/>}
                                </button>
                            </form>
                        </div>
                    </div>
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatForm;
