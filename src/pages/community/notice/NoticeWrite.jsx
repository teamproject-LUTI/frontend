import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/notice/NoticeWrite.css';
import { Editor } from '@toast-ui/react-editor';
import { useAuth } from '../../../util/AuthContext';  // <-- AuthContext 훅 import

const NoticeWrite = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);

    // AuthContext에서 userId, token 가져오기
    const { userId, accessToken: token } = useAuth();

    // 제목 상태
    const [title, setTitle] = useState('');

    // 마운트 시 에디터 내용 초기화
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.getInstance().setMarkdown('');
        }
    }, []);

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        // 에디터에서 HTML 컨텐츠 꺼내기
        const contentHtml = editorRef.current.getInstance().getHTML();

        try {
            // 기존 NoticeController#createNotice(Long userId, NoticeRequestDto dto) 방식에 맞춰
            // userId 쿼리스트링, body에 DTO와 인증 헤더 전달
            await axios.post(
                // `/api/notices?userId=${userId}`,
                '/api/notices',
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

            // 작성 완료 후 공지사항 목록 페이지로 이동
            navigate('/community/notice');
        } catch (err) {
            console.error('공지사항 저장 실패:', err);
            alert('공지사항 저장에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <form className="notice-write-form" onSubmit={handleSubmit}>
                        <h2>공지 작성</h2>

                        <div className="form-group">
                            <label htmlFor="notice-title">제목</label>
                            <input
                                id="notice-title"
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
                                        // 필요한 엔드포인트 수정
                                        const imgRes = await axios.post(
                                            '/api/notice-attachments/image',
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
                                onClick={() => navigate('/community/notice')}
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default NoticeWrite;
