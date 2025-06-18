import React, { useState } from 'react';
import { Search } from "lucide-react";

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