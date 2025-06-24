import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
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
    const fileInputRef = useRef(null);

    // 첨부파일 관련 상태
    const [existingFiles, setExistingFiles] = useState([]); // 서버에 저장된 파일 목록
    const [toDeleteIds, setToDeleteIds] = useState([]); // 삭제 대기 ID들
    const [newFiles, setNewFiles] = useState([]);  // 새로 선택한 파일들

    // 기존 공지사항 데이터를 불러와 폼 초기화
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 공지사항 데이터
                const noticeRes = await axios.get(`/api/notices/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dto = noticeRes.data.data;
                setTitle(dto.title);
                setInitialContent(dto.content);

                // 기존 첨부파일 목록도 같이 불러오기
                const attachRes = await axios.get(`/api/notices/${id}/attachments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExistingFiles(attachRes.data.data || []);

            } catch (err) {
                console.error('데이터 조회 실패:', err);
            }
        };
        fetchData();
    }, [id, token]);

    // initialContent로 에디터 설정
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
            // 1) 공지사항 수정
            await axios.patch(
                `/api/notices/${id}`,
                { title, content: html },
                { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );

            // 2) 삭제 요청 보낼 ID들
            await Promise.all(toDeleteIds.map(fileNo =>
                axios.delete(
                    `/api/notices/${id}/attachments/${fileNo}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ));

            // 3) 새로 추가된 파일 업로드
            if (newFiles.length > 0) {
                const formData = new FormData();
                newFiles.forEach(f => formData.append('files', f));
                await axios.post(
                    `/api/notices/${id}/attachments`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

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

                        {/* 기존 첨부파일 목록 */}
                        {existingFiles.length > 0 && (
                            <div className="edit-attachments">
                                <span className="edit-attachments-label">기존 첨부파일</span>
                                <ul className="edit-attachments-list">
                                    {existingFiles.map(att => (
                                        <li key={att.fileNo}>
                                            <span className="edit-attachment-name">
                                                📄 {att.fileName}
                                            </span>
                                            <button
                                                type="button"
                                                className="edit-attachment-remove"
                                                onClick={() => {
                                                    setToDeleteIds(ids => [...ids, att.fileNo]);
                                                    setExistingFiles(files => files.filter(f => f.fileNo !== att.fileNo));
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* 첨부파일 추가 */}
                        <div className="form-group edit-attachment-upload">
                            <label>첨부파일 추가</label>
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.xls,.xlsx,.doc,.docx"
                                ref={fileInputRef}
                                onChange={e => setNewFiles([...e.target.files])}
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