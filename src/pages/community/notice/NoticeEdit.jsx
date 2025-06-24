// src/pages/community/notice/NoticeEdit.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Editor } from '@toast-ui/react-editor';
import '../../../styles/community/notice/NoticeEdit.css';

const NoticeEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const [title, setTitle] = useState('');
    const [initialContent, setInitialContent] = useState('');
    const editorRef = useRef(null);

    // 기존 공지사항 데이터를 불러와 폼 초기화
    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const res = await axios.get(`/api/notices/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dto = res.data.data;
                setTitle(dto.title);
                setInitialContent(dto.content);
            } catch (err) {
                console.error('공지사항 조회 실패:', err);
            }
        };
        fetchNotice();
    }, [id, token]);

    // initialContent 로 에디터 설정
    useEffect(() => {
        if (editorRef.current && initialContent !== '') {
            const editor = editorRef.current.getInstance();
            editor.setHTML(initialContent);
        }
    }, [initialContent]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const html = editorRef.current.getInstance().getHTML();

        try {
            await axios.patch(
                `/api/notices/${id}`,
                { title, content: html },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            navigate(`/community/notice/${id}`);
        } catch (err) {
            console.error('공지사항 수정 실패:', err);
            alert('수정 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    // 데이터 로딩 전 렌더 방지
    if (initialContent === '') return null;

    return (
        <div className="main-layout">

            <div className="main-content-wrapper">

                <main className="main-content">
                    <form className="notice-edit-form" onSubmit={handleSubmit}>
                        <h2>공지사항 수정</h2>

                        <div className="form-group">
                            <label htmlFor="notice-title">제목</label>
                            <input
                                id="notice-title"
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>내용</label>
                            <Editor
                                ref={editorRef}
                                initialValue={initialContent}
                                previewStyle="vertical"
                                initialEditType="wysiwyg"
                                height="400px"
                                useCommandShortcut={true}
                                hideModeSwitch={true}
                                hooks={{
                                    addImageBlobHook: async (blob, callback) => {
                                        const formData = new FormData();
                                        formData.append('image', blob);
                                        // 공지사항 첨부용 이미지 업로드 엔드포인트
                                        const res = await axios.post(
                                            '/api/notice-attachments/image',
                                            formData,
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        );
                                        callback(res.data.url, '업로드된 이미지');
                                    }
                                }}
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit" className="save-btn">수정 완료</button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate(`/community/notice/${id}`)}
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

export default NoticeEdit;
