// src/pages/community/qna/QnaWrite.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/community/qna/QnaWrite.css';
import { Editor } from '@toast-ui/react-editor';
import { useAuth } from '../../../util/AuthContext';  // <-- AuthContext 훅 import

const QnaWrite = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    // AuthContext 에서 userId, token 꺼내기
    const { userId, accessToken: token } = useAuth();

    // 제목
    const [title, setTitle] = useState('');

    // 마운트 시 에디터 내용 초기화
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.getInstance().setMarkdown('');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 에디터에서 HTML 컨텐츠를 꺼냅니다
        const contentHtml = editorRef.current.getInstance().getHTML();

        try {
            // 기존 AskController#createAsk(Long userId, AskRequestDto dto) 에 맞춰
            // userId 를 쿼리스트링으로, body 에 DTO, 그리고 인증 헤더 전달
            await axios.post(
                `/api/asks?userId=${userId}`,
                {
                    title,
                    content: contentHtml
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // 작성 완료 후 Q&A 목록으로 이동
            navigate('/community/qna');
        } catch (err) {
            console.error('문의 저장 실패:', err);
            alert('문의 저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className="main-layout">

            <div className="main-content-wrapper">

                <main className="main-content">
                    <form className="qna-form" onSubmit={handleSubmit}>
                        <h2>문의 작성</h2>

                        <div className="form-group">
                            <label htmlFor="qna-title">제목</label>
                            <input
                                id="qna-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="제목을 입력하세요"
                            />
                        </div>

                        <div className="form-group">
                            <label>내용</label>
                            <Editor
                                ref={editorRef}
                                initialValue=""
                                previewStyle="vertical"
                                initialEditType="wysiwyg"
                                height="400px"
                                useCommandShortcut={true}
                                hideModeSwitch={true}
                                hooks={{
                                    addImageBlobHook: async (blob, callback) => {
                                        const formData = new FormData();
                                        formData.append('image', blob);
                                        // 필요에 따라 엔드포인트 수정
                                        const imgRes = await axios.post(
                                            '/api/ask-attachments/image',
                                            formData,
                                            { headers: { 'Content-Type': 'multipart/form-data' } }
                                        );
                                        callback(imgRes.data.url, '업로드된 이미지');
                                    }
                                }}
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="save-btn">
                                저장하기
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate('/community/qna')}
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </main>
            </div>

        </div>
    );
};

export default QnaWrite;
