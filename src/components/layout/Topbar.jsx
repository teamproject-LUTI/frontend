import React, { useState } from 'react';
import { Plane, Bell, User, Search } from 'lucide-react';
import '../../styles/layout/Topbar.css';

const Topbar = () => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!keyword.trim()) return;

    try {
      const response = await fetch(`http://localhost:8080/luti/naver/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await response.text(); // 백엔드가 text 응답일 경우

      console.log('검색 결과:', data);

    } catch (error) {
      console.error('API 요청 중 오류:', error);
    }
  };
  return (
      <header className="topbar">
        <div className="topbar-container">
          <div className="topbar-content">
            {/* Logo */}
            <div className="logo-section">
              <div className="logo-container">
                <img src="/images/topbar/luti_logo.png" alt="LUTI Logo" className="logo-image" />
                {/*<span className="logo-text">LUTI</span>*/}
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-section">
              <form onSubmit={handleSearch} className="search-container">
                <Search className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }} />
                <input
                    type="text"
                    placeholder="여행지, 숙소, 액티비티 검색..."
                    className="search-input"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                />
              </form>
            </div>

            {/* Right Menu */}
            <div className="user-section">

              <div className="user-info">
                <div className="user-avatar">
                  <User className="user-icon" />
                </div>
                <span className="user-name">사용자님</span>
              </div>
            </div>
          </div>
        </div>
      </header>
  );
};

export default Topbar;
