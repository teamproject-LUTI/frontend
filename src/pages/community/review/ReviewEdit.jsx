import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
// import '../../../styles/community/review/ReviewEdit.css';
import { Editor } from '@toast-ui/react-editor';

const ReviewEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');
    const [title, setTitle] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // 에디터 인스턴스에 접근하기 위한 ref
    const editorRef = useRef(null);
    // 서버에서 받아온 HTML을 담는 초기 컨텐츠 상태
    const [initialContent, setInitialContent] = useState('');

    // 여행기간 문자열 조립
    const travelPeriod = startDate && endDate ? `${startDate} ~ ${endDate}` : '';

    // 리뷰 데이터를 가져와 상태 세팅
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 리뷰 데이터
                const revRes = await axios.get(`/api/reviews/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const dto = revRes.data.data;
                setTitle(dto.title);
                setDestination(dto.travelRegion);
                console.log('travelPeriod:', dto.travelPeriod);
                // 기존에 있던 content 상태 대신, 에디터 초기화용으로 initialContent에 담아야 함
                setInitialContent(dto.content); // 에디터 초기값 설정

                // 여행기간 파싱
                if (dto.travelPeriod && dto.travelPeriod.includes('~')) {
                    const [start, end] = dto.travelPeriod.split('~').map(s => s.trim());
                    setStartDate(start);
                    setEndDate(end);
                } else {
                    setStartDate('');
                    setEndDate('');
                }
            } catch (err) {
                console.error('데이터 조회 실패', err);
            }
        };
        fetchData();
    }, [id, token]);

    // 초기 콘텐츠를 에디터에 설정
    // initialContent가 변경되면 에디터에 HTML로 세팅
    useEffect(() => {
        if (editorRef.current && initialContent) {
            const editor = editorRef.current.getInstance();
            editor.setHTML(initialContent);
        }
    }, [initialContent]);

    // 수정 완료 시 호출되는 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {

            // 에디터에서 최신 HTML 가져오기
            const html = editorRef.current.getInstance().getHTML();
            
            // 리뷰 수정 API 호출
            await axios.put(
                `/api/reviews/${id}`,
                {
                    title,
                    travelRegion: destination,
                    content: html,
                    travelPeriod
                },
                {
                    headers:
                        {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                }
            );
            // 완료 후 상세 페이지로 이동
            navigate(`/community/review/${id}`);
        } catch (err) {
            console.error('수정 실패', err);
        }
    };
    //데이터를 아직 안받았다면 아무것도 렌더링하지 않음
    if (!initialContent) return null;

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    <form className="review-form" onSubmit={handleSubmit}>
                        <h2>리뷰 수정</h2>

                        <div className="form-group">
                            <label>제목</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>여행지</label>
                            <input
                                type="text"
                                value={destination}
                                onChange={e => setDestination(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>여행 기간</label>
                            <div className="date-range">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    required
                                />
                                <span className="separator">~</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <Editor
                                key={initialContent}        // initialContent 변경 시 에디터 리마운트
                                previewStyle="vertical"
                                initialEditType="wysiwyg"
                                height="500px"
                                useCommandShortcut={true}
                                hideModeSwitch={true}
                                initialValue={initialContent}  // 초기값: 기존 HTML
                                ref={editorRef}               // 에디터 인스턴스 참조
                                hooks={{
                                    addImageBlobHook: async (blob, callback) => {
                                        const formData = new FormData();
                                        formData.append('image', blob);
                                        // 에디터 전용 이미지 업로드 API 호출
                                        const res = await axios.post(
                                            '/api/review-attachments/image',
                                            formData
                                        );
                                        // 서버가 반환한 URL을 에디터에 삽입
                                        callback(res.data.url, '업로드된 이미지');
                                    }
                                }}
                            />
                        </div>

                        <div className="button-group">
                            <button type="submit">수정 완료</button>
                        </div>
                    </form>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ReviewEdit;
