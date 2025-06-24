// src/pages/community/qna/QnaEdit.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Editor } from '@toast-ui/react-editor';

const QnaEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const [title, setTitle] = useState('');
    const [initialContent, setInitialContent] = useState('');

    const editorRef = useRef(null);

    // 1) 기존 문의글 조회
    useEffect(() => {
        const fetchQna = async () => {
            try {
                const res = await axios.get(`/api/asks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dto = res.data.data || res.data; // 응답 구조에 맞게 조정
                setTitle(dto.title);
                setInitialContent(dto.content);
            } catch (err) {
                console.error('문의글 조회 실패', err);
            }
        };
        fetchQna();
    }, [id, token]);

    // 2) initialContent가 준비되면 에디터에 HTML 세팅
    useEffect(() => {
        if (editorRef.current && initialContent) {
            const editor = editorRef.current.getInstance();
            editor.setHTML(initialContent);
        }
    }, [initialContent]);

    // 3) 수정 완료 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        const html = editorRef.current.getInstance().getHTML();

        try {
            await axios.patch(
                `/api/asks/${id}`,
                { title, content: html },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            navigate(`/community/qna/${id}`);
        } catch (err) {
            console.error('문의글 수정 실패', err);
            alert('수정에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 데이터 로딩 전에는 아무것도 렌더링하지 않음
    if (!initialContent) return null;

    return (
        <div className="main-layout">

            <div className="main-content-wrapper">

                <main className="main-content">
                    <form className="qna-form" onSubmit={handleSubmit}>
                        <h2>문의 수정</h2>

                        <div className="form-group">
                            <label htmlFor="qna-title">제목</label>
                            <input
                                id="qna-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>내용</label>
                            <Editor
                                key={initialContent}             // initialContent 변경 시 리마운트
                                ref={editorRef}
                                initialValue={initialContent}    // 기존 HTML
                                previewStyle="vertical"
                                initialEditType="wysiwyg"
                                height="500px"
                                useCommandShortcut={true}
                                hideModeSwitch={true}
                                hooks={{
                                    addImageBlobHook: async (blob, callback) => {
                                        const formData = new FormData();
                                        formData.append('image', blob);
                                        const imgRes = await axios.post(
                                            '/api/ask-attachments/image',
                                            formData
                                        );
                                        callback(imgRes.data.url, '업로드된 이미지');
                                    }
                                }}
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="save-btn">
                                수정 완료
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

export default QnaEdit;
