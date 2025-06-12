import React, { useState } from 'react';
import {
  Home,
  MessageSquareMore,
  FileText,
  Volume2,
  HelpCircle,
  User,
  Star,
  ChevronDown,
  ChevronUp, Menu
} from 'lucide-react';
import '../../styles/layout/Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(true); // 기본 열림 상태

  const menuItems = [
    { icon: Home, label: '홈', path: '/' },
    { icon: MessageSquareMore, label: '커뮤니티', isToggle: true },
    { icon: FileText, label: '후기', path: '/community/review', parent: '커뮤니티' },
    { icon: Volume2, label: '공지사항', path: '/community/notice', parent: '커뮤니티' },
    { icon: HelpCircle, label: '문의내역', path: '/community/qna', parent: '커뮤니티' },
    { icon: User, label: '마이페이지', path: '/mypage' },
    { icon: Star, label: '즐겨찾기', path: '/favorites' },
  ];

  return (
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="sidebar-content">
          {/* Toggle Button */}
          <div className="toggle-section">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="toggle-btn"
            >
              <Menu className="toggle-icon" />

            </button>
          </div>

          {/* Menu Items */}
          <nav className="sidebar-nav">
            {menuItems.map((item, index) => {
              // 커뮤니티 토글 버튼
              if (item.isToggle) {
                return (
                    <button
                        key={index}
                        onClick={() => setIsCommunityOpen(!isCommunityOpen)}
                        className={`nav-item ${isCollapsed ? 'collapsed' : 'expanded'}`}
                    >
                      <item.icon className="nav-icon" />
                      <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                    {item.label}
                  </span>
                      {!isCollapsed &&
                          (isCommunityOpen ? (
                              <ChevronUp className="nav-icon" />
                          ) : (
                              <ChevronDown className="nav-icon" />
                          ))}
                    </button>
                );
              }

              // 하위 메뉴인데 사이드바가 닫혀있거나, 토글이 닫혀있으면 숨김
              if (item.parent === '커뮤니티') {
                if (isCollapsed || !isCommunityOpen) return null;
              }

              // 기본 메뉴 출력
              return (
                  <button
                      key={index}
                      className={`nav-item ${isCollapsed ? 'collapsed' : 'expanded'} ${
                          item.parent ? 'sub-item' : ''
                      }`}
                  >
                    <item.icon className="nav-icon" />
                    <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                  {item.label}
                </span>
                  </button>
              );
            })}
          </nav>
        </div>
      </aside>
  );
};

export default Sidebar;
