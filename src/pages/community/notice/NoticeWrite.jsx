import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../styles/community/notice/NoticeWrite.css';
import { Editor } from '@toast-ui/react-editor';
import { useAuth } from '../../../util/AuthContext';

const NoticeWrite = () => {
    const navigate = useNavigate();
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    // AuthContext에서 userId, token 가져오기
    const { userId, accessToken: token } = useAuth();

    // 제목 상태
    const [title, setTitle] = useState('');
    // 첨부파일 상태
    const [attachments, setAttachments] = useState([]);
    // 로딩 상태 추가
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 마운트 시 에디터 내용 초기화
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.getInstance().setMarkdown('');
        }
    }, []);

    // 입력 검증 함수
    const validateInputs = () => {
        if (!title.trim()) {
            alert('제목을 입력해주세요.');
            return false;
        }

        const contentHtml = editorRef.current.getInstance().getHTML();
        if (!contentHtml || contentHtml.trim() === '<p><br></p>' || contentHtml.trim() === '') {
            alert('내용을 입력해주세요.');
            return false;
        }

        // 첨부파일 크기 검증 (각 파일 최대 10MB)
        for (let i = 0; i < attachments.length; i++) {
            const file = attachments[i];
            if (file.size > 10 * 1024 * 1024) {
                alert(`파일 "${file.name}"의 크기가 너무 큽니다. (최대 10MB)`);
                return false;
            }
        }

        return true;
    };

    // noticeId 추출 함수
    const extractNoticeId = (responseData) => {
        console.log('공지사항 저장 응답:', responseData);

        let noticeId;

        // 다양한 응답 구조에 대응
        if (responseData.data && typeof responseData.data === 'object') {
            // data가 객체인 경우 (일반적인 케이스)
            noticeId = responseData.data.id || responseData.data.noticeId || responseData.data.notice_id;
        } else if (typeof responseData.data === 'number') {
            // data가 숫자(ID)인 경우
            noticeId = responseData.data;
        } else if (responseData.id) {
            // 직접 id 필드가 있는 경우
            noticeId = responseData.id;
        } else if (responseData.noticeId) {
            // noticeId 필드가 있는 경우
            noticeId = responseData.noticeId;
        }

        console.log('추출된 noticeId:', noticeId);
        return noticeId;
    };

    // 공지사항 저장 함수
    const saveNotice = async (title, contentHtml) => {
        console.log('공지사항 저장 요청:', { title, content: contentHtml });

        const response = await axios.post(
            '/api/notices',
            {
                title: title.trim(),
                content: contentHtml
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response;
    };

    // 첨부파일 업로드 함수
    const uploadAttachments = async (noticeId, files) => {
        if (!files || files.length === 0) return;

        console.log('첨부파일 업로드 시작:', files.length, '개 파일');

        const formData = new FormData();

        // 파일 추가 및 로그
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            console.log(`파일 ${i + 1}:`, {
                name: file.name,
                size: file.size,
                type: file.type
            });
            formData.append('files', file);
        }

        // 첨부파일 업로드 요청
        const response = await axios.post(
            `/api/notices/${noticeId}/attachments`,
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Content-Type을 명시적으로 설정하지 않음 (브라우저가 자동으로 multipart/form-data와 boundary 설정)
                },
                timeout: 30000, // 30초 타임아웃
            }
        );

        console.log('첨부파일 업로드 완료:', response.data);
        return response;
    };

    // 에러 메시지 생성 함수
    const getErrorMessage = (error) => {
        if (error.response) {
            // 서버에서 응답이 온 경우
            console.error('에러 응답:', error.response.data);
            console.error('에러 상태:', error.response.status);

            switch (error.response.status) {
                case 400:
                    return '잘못된 요청입니다. 입력 내용을 확인해주세요.';
                case 401:
                    return '인증이 필요합니다. 다시 로그인해주세요.';
                case 403:
                    return '권한이 없습니다.';
                case 413:
                    return '파일 크기가 너무 큽니다.';
                case 500:
                    return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                default:
                    return `오류가 발생했습니다. (상태: ${error.response.status})`;
            }
        } else if (error.request) {
            // 요청은 했지만 응답이 없는 경우
            return '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
        } else if (error.message) {
            // 기타 오류
            return error.message;
        }

        return '알 수 없는 오류가 발생했습니다.';
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();

        // 중복 제출 방지
        if (isSubmitting) return;

        // 입력 검증
        if (!validateInputs()) return;

        setIsSubmitting(true);

        try {
            // 에디터에서 HTML 컨텐츠 꺼내기
            const contentHtml = editorRef.current.getInstance().getHTML();

            // 1) 공지사항 본문 저장
            const noticeRes = await saveNotice(title, contentHtml);

            // 2) noticeId 추출
            const noticeId = extractNoticeId(noticeRes.data);

            if (!noticeId) {
                console.error('noticeId를 찾을 수 없습니다:', noticeRes.data);
                throw new Error('공지사항 저장은 완료되었지만 ID를 확인할 수 없습니다.');
            }

            // 3) 첨부파일 업로드 (있을 경우에만)
            if (attachments.length > 0) {
                await uploadAttachments(noticeId, attachments);
            }

            // 성공 메시지 표시
            alert('공지사항이 성공적으로 저장되었습니다.');

            // 작성 완료 후 공지사항 목록 페이지로 이동
            navigate('/community/notice');

        } catch (err) {
            console.error('공지사항 저장 실패:', err);

            const errorMessage = getErrorMessage(err);
            alert(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 첨부파일 변경 핸들러
    const handleFileChange = (e) => {
        const files = [...e.target.files];

        // 파일 개수 제한 (예: 최대 5개)
        if (files.length > 5) {
            alert('첨부파일은 최대 5개까지 선택할 수 있습니다.');
            fileInputRef.current.value = '';
            return;
        }

        // 파일 크기 사전 검증
        const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            alert(`다음 파일들의 크기가 너무 큽니다: ${oversizedFiles.map(f => f.name).join(', ')}`);
            fileInputRef.current.value = '';
            return;
        }

        setAttachments(files);
    };

    // 이미지 업로드 훅 (에디터 내 이미지)
    const handleImageUpload = async (blob, callback) => {
        try {
            const formData = new FormData();
            formData.append('image', blob);

            const imgRes = await axios.post(
                '/api/notice-attachments/image',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // Content-Type은 브라우저가 자동 설정
                    }
                }
            );

            callback(imgRes.data.url, '업로드된 이미지');
        } catch (error) {
            console.error('이미지 업로드 실패:', error);
            alert('이미지 업로드에 실패했습니다.');
        }
    };

    return (
        <div className="main-layout">
            <div className="main-content-wrapper">
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
                                disabled={isSubmitting}
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
                                    addImageBlobHook: handleImageUpload
                                }}
                            />
                        </div>

                        <div className="form-group">
                            <label>첨부파일</label>
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.xls,.xlsx,.doc,.docx"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                disabled={isSubmitting}
                            />
                            {attachments.length > 0 && (
                                <div className="file-list">
                                    <p>선택된 파일: {attachments.length}개</p>
                                    {attachments.map((file, index) => (
                                        <div key={index} className="file-item">
                                            {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="button-group">
                            <button
                                type="submit"
                                className="save-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '저장 중...' : '저장하기'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate('/community/notice')}
                                disabled={isSubmitting}
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

export default NoticeWrite;