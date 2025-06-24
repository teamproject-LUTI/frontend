import React, { useState, useRef, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/community/review/ReviewWrite.css'
import { Editor } from '@toast-ui/react-editor';
import axios from "axios";

const ReviewWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  //에디터 참조를 위한 useRef
  const editorRef = useRef(null);

  //기본 썸네일(이미지 없을 경우)
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const defaultThumbnail = '/images/no_Image.png';

  const [attachments, setAttachments] = useState([]);  // 파일 객체들
  const fileInputRef = useRef(null); // 파일 선택 input 참조

  // 로딩 상태 추가
  const [isSubmitting, setIsSubmitting] = useState(false);

  //빈 문서로 설정(Markdown 초기화)
  useEffect(() => {
    const editorIns = editorRef.current?.getInstance();
    if (!editorIns) return;

    // 1) 에디터 마크다운 빈 문자열로 초기화
    editorIns.setMarkdown('');

    // 2) 에디터 내용이 바뀔 때마다 첫 번째 <img> 태그 src 가져오기
    editorIns.on('change', () => {
      const html = editorIns.getHTML();
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const firstImg = tmp.querySelector('img');
      setThumbnailPreview(firstImg?.src || '');
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 여행기간 문자열 조립
    const travelPeriod = startDate && endDate ? `${startDate} ~ ${endDate}` : '';
    // 에디터에서 본문 HTML 가져오기
    const html = editorRef.current?.getInstance().getHTML();

    try {
      //  리뷰 본문 저장
      const reviewRes = await axios.post('/api/reviews', {
        title,
        travelRegion: destination,
        content: html,  //에디터에서 가져온 본문(HTML)
        travelPeriod,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      console.log('✏️ reviewRes.data =', reviewRes.data);

      // reviewId 꺼내기
      const reviewId = reviewRes.data.data;
      if (!reviewId) {
        console.error('reviewId가 없습니다!', reviewRes.data);
        return;
      }

      // (디버그) URL 확인
      console.log(`▶ 업로드 URL = /api/reviews/${reviewId}/attachments`);

      // 첨부파일 업로드 (있을 경우에만)
      if (attachments.length > 0) {
        const formData = new FormData();

        attachments.forEach(file => formData.append('files', file));

        await axios.post(`/api/reviews/${reviewId}/attachments`, formData, {
          headers: {
            //'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      }

      // 저장하기 버튼 누르면 리뷰 목록 페이지로 이동
      navigate('/community/review');

    } catch (error) {
      alert('리뷰 저장 실패!\n' + (error?.response?.data?.message || error.message));
      console.error('리뷰 저장 실패:', error);
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


  return (
      <div className="main-layout">
        <div className="main-content-wrapper">
          <main className="main-content">
            <form className="review-write-form " onSubmit={handleSubmit}>
              <h2>리뷰 작성</h2>
              <div className="form-group">
                <label>제목</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
              </div>

              <div className="form-group">
                <label>여행지</label>
                <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="예: 제주도"
                    required
                />
              </div>

              <div className="form-group">
                <label>여행 기간</label>
                <div className="date-range">
                  <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                  />
                  <span className="separator">~</span>
                  <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>썸네일 미리보기</label>
                <div className="thumbnail-preview">
                  <img
                      src={thumbnailPreview || defaultThumbnail}
                      alt={thumbnailPreview ? '미리보기 썸네일' : '기본 썸네일'}
                      className="review-thumbnail"
                  />
                </div>
              </div>

              <div className="form-group">

                {/* Toast UI Editor로 대체 */}
                <Editor
                    previewStyle="vertical"   //미리보기 스타일 세로
                    initialEditType="wysiwyg" //위지윅 모드로 시작
                    height="500px"
                    useCommandShortcut={true} //단축키 사용
                    hideModeSwitch={true}     // 마크다운/위지윅 모드 전환 탭 숨기기
                    initialValue=""           //빈 문자열로 설정
                    ref={editorRef}           //ref 연결
                    hooks={{              //이미지 업로드 훅
                      //addImageBlobHook: 에디터에 붙여진 이미지 블롭(Blob)을 서버에 업로드하고 콜백으로 URL을 에디터에 삽입
                      addImageBlobHook: async (blob, callback) => {
                        const formData = new FormData();
                        formData.append('image', blob);

                        const res = await axios.post('/api/review-attachments/image', formData); // 에디터 이미지 업로드 전용 엔드포인트
                        const imageUrl = res.data.url;
                        //에디터에 업로드 된 이미지 URL과 대체 텍스트 삽입
                        callback(imageUrl, '업로드된 이미지');
                      }
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
                            📄{file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
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
                    onClick={() => navigate('/community/review')}
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

export default ReviewWrite;

