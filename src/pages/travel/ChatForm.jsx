import React, { useState } from 'react';
import { Search } from "lucide-react";

/* ────────── 일정 카드 ────────── */
const TravelCard = ({ plan }) => (
    <div className="border p-4 rounded-lg shadow-md mb-4 bg-white">
        <h3 className="text-lg font-bold text-blue-600 mb-2">
            {plan.day} - {plan.location}
        </h3>
        <ul className="list-disc pl-5 text-sm text-gray-800">
            {plan.activities?.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
        {plan.note && <p className="text-xs text-gray-500 mt-2">💡 {plan.note}</p>}
    </div>
);

/* ────────── 호텔 카드 ────────── */
const HotelCard = ({ hotel }) => (
    <div className="border p-4 rounded-lg shadow-md mb-4 bg-white">
        <h3 className="text-lg font-bold text-green-600 mb-1">{hotel.name}</h3>
        <p className="text-sm text-gray-700">{hotel.address}</p>
        <p className="text-sm font-semibold mt-2">
            {hotel.price} {hotel.currency}
        </p>
    </div>
);

/* ────────── 메인 컴포넌트 ────────── */
const ChatForm = () => {

    const [prompt, setPrompt] = useState('');
    const [plans,  setPlans]  = useState([]);
    const [hotels, setHotels] = useState([]);
    const [error,  setError]  = useState('');

    /* GPT + 호텔 검색 요청 */
    const sendPrompt = async (e) => {
        e.preventDefault();
        setError('');
        setPlans([]);
        setHotels([]);

        try {
            const res  = await fetch('http://localhost:8080/chat/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                credentials: 'include',
                body: prompt
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();

            setPlans(json.plan  || []);
            setHotels(json.hotels || []);
        } catch (err) {
            console.error('요청 실패:', err);
            setError('여행 추천을 가져오지 못했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <div className="chat-form p-4 max-w-3xl mx-auto">

            {/* ── 입력창 ── */}
            <form onSubmit={sendPrompt}
                  className="flex items-center border rounded-lg px-3 py-2 shadow-sm mb-6 bg-white">
                <Search className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder={"예: 힐링 여행 2박 3일 방콕"}
                    className="flex-1 outline-none text-sm"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
            </form>

            {/* ── 오류 ── */}
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            {/* ── 일정 카드 ── */}
            {plans.length > 0 && (
                <>
                    <h4 className="text-lg font-semibold mb-3 text-gray-700">🗓️ GPT 추천 일정</h4>
                    {plans.map((p, i) => <TravelCard key={i} plan={p} />)}
                </>
            )}

            {/* ── 호텔 카드 ── */}
            {hotels.length > 0 && (
                <>
                    <h4 className="text-lg font-semibold mb-3 text-gray-700">🏨 추천 숙소</h4>
                    {hotels.map((h, i) => <HotelCard key={i} hotel={h} />)}
                </>
            )}
        </div>
    );
};

export default ChatForm;
