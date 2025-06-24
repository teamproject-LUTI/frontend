import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import axios from 'axios';
import { Editor } from '@toast-ui/react-editor';

const QnaEdit = () => {
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

    // 1) 기존 문의글 조회
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 문의글 데이터
                const askRes = await axios.get(`/api/asks/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dto = askRes.data.data || askRes.data;
                setTitle(dto.title);
                setInitialContent(dto.content);

                // 기존 첨부파일 목록도 같이 불러오기
                const attachRes = await axios.get(`/api/asks/${id}/attachments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setExistingFiles(attachRes.data.data || []);

            } catch (err) {
                console.error('데이터 조회 실패', err);
            }
        };
        fetchData();
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
            // 1) 문의글 수정
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

            // 2) 삭제 요청 보낼 ID들
            await Promise.all(toDeleteIds.map(attachmentId =>
                axios.delete(
                    `/api/asks/${id}/attachments/${attachmentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ));

            // 3) 새로 추가된 파일 업로드
            if (newFiles.length > 0) {
                const formData = new FormData();
                newFiles.forEach(f => formData.append('files', f));
                await axios.post(
                    `/api/asks/${id}/attachments`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

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

                        {/* 기존 첨부파일 목록 */}
                        {existingFiles.length > 0 && (
                            <div className="edit-attachments">
                                <span className="edit-attachments-label">기존 첨부파일</span>
                                <ul className="edit-attachments-list">
                                    {existingFiles.map(att => (
                                        <li key={att.askAttachmentId}>
                                            <span className="edit-attachment-name">
                                                📄 {att.fileName}
                                            </span>
                                            <button
                                                type="button"
                                                className="edit-attachment-remove"
                                                onClick={() => {
                                                    setToDeleteIds(ids => [...ids, att.askAttachmentId]);
                                                    setExistingFiles(files => files.filter(f => f.askAttachmentId !== att.askAttachmentId));
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
                                accept=".pdf,.xls,.xlsx,.doc,.docx,.png,.jpg,.jpeg,.gif"
                                ref={fileInputRef}
                                onChange={e => setNewFiles([...e.target.files])}
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