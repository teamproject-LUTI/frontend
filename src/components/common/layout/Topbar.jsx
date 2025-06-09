import React from 'react';
import { Plane, Bell, User, Search } from 'lucide-react';
import '../../../styles/layout/Topbar.css';

const Topbar = () => {
  return (
      <header className="topbar">
        <div className="topbar-container">
          <div className="topbar-content">
            {/* Logo */}
            <div className="logo-section">
              <div className="logo-container">
                <Plane className="logo-icon" />
                <span className="logo-text">LUTI</span>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-section">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                    type="text"
                    placeholder="여행지, 숙소, 액티비티 검색..."
                    className="search-input"
                />
              </div>
            </div>

            {/* Right Menu */}
            <div className="user-section">
              <button className="notification-btn">
                <Bell className="notification-icon" />
                <span className="notification-badge"></span>
              </button>

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
