import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../../components/layout/Topbar';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import '../../../styles/community/review/ReviewWrite.css'

const ReviewWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 저장 API 호출
    console.log('저장', { title, destination, startDate, endDate, content, files });
    navigate('/reviews');
  };

  return (
    <div className="main-layout">
      <Topbar />
      <div className="main-content-wrapper">
        <Sidebar />
        <main className="main-content">
          <form className="review-form" onSubmit={handleSubmit}>
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
              <label>내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                required
              />
            </div>

            <div className="form-group">
              <label>첨부파일</label>
              <input type="file" multiple onChange={handleFileChange} />
            </div>

            <div className="button-group">
              <button type="submit">저장하기</button>
            </div>
          </form>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ReviewWrite;

