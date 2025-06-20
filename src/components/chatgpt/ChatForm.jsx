import React, {useState} from 'react';
import {Search, MapPin, Calendar, Users, Loader2, Send} from "lucide-react";
import '../../styles/chatgpt/ChatForm.css';

/* ────────── 추천 여행 루트 카드 ────────── */
const TravelRouteCard = ({route, isSelected, onSelect, loading}) => {

    // 당일치기 여행 여부 확인(체크인/아웃 날짜가 같거나 일정이 1일만 있는 경우)
    // 수정 - 더 정확한 당일치기 판단
    const isDayTrip = route.title?.toLowerCase().includes('당일치기') ||
        route.title?.toLowerCase().includes('데이트리') ||
        route.title?.toLowerCase().includes('일일') ||
        (route.itinerary && route.itinerary.length === 1) ||
        !route.hotel; // 호텔 정보가 없으면 당일치기

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
                    <div className="route-price">
                        {route.totalPrice}{route.currency}
                    </div>
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

// ChatGPT API와 통신하기 위한 폼 컴포넌트
const ChatForm = () => {
    // 사용자가 입력한 프롬프트(검색어)를 저장하는 상태
    const [prompt, setPrompt] = useState('');
    // ChatGPT로부터 받은 응답을 저장하는 상태
    const [response, setResponse] = useState('');

    // 폼 제출 시 실행되는 함수
    const sendPrompt = async (e) => {
        e.preventDefault(); // 폼 기본 동작(페이지 새로고침) 방지

        try {
            // 서버의 /chat/ask 엔드포인트로 POST 요청 보내기
            const res = await fetch('/chat/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // 서버가 받을 수 있는 형식으로 전송
                },
                body: 'prompt=' + encodeURIComponent(prompt), // 사용자 입력을 전송
            });

            // 서버 응답을 텍스트로 받아서 상태에 저장
            const text = await res.text();
            setResponse(text);
        } catch (error) {
            // 에러 발생 시 콘솔에 출력하고 사용자에게 메시지 표시
            console.error('ChatGPT 요청 실패:', error);
            setResponse('오류가 발생했습니다.');
        }
    };

    return (
        <div className="chat-form">
            {/* 사용자 입력 폼 영역 */}
            <form onSubmit={sendPrompt} className="main-search-container">
                <Search className={"main-search-icon"} />
                <input
                    type="text"
                    placeholder="여행지, 숙소, 액티비티 검색..." // 입력창 안내문구
                    className="main-search-input" // 스타일링 클래스
                    value={prompt} // 상태와 input 값 바인딩
                    onChange={(e) => setPrompt(e.target.value)} // 입력 시 상태 변경
                />
            </form>

            {/* 응답 결과 출력 영역 */}
            {response && (
                <div className="chat-response">
                    <h4>추천 결과</h4>
                    <pre>{response}</pre> {/* 줄바꿈 포함해서 출력 */}
                </div>
            )}
        </div>
    );
};

export default ChatForm;