import React, { useState, useEffect } from 'react';
import {
  Home,
  MessageSquareMore,
  FileText,
  Volume2,
  HelpCircle,
  User,
  Star,
  ChevronDown,
  ChevronUp,
  Menu,
  Edit3,
  Trash2,
  CreditCard,
  MessageCircle,
  PenTool,
  MapPin,
  Calendar
} from 'lucide-react';
import '../../styles/layout/Sidebar.css';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(true);
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);
  const [isTravelInfoOpen, setIsTravelInfoOpen] = useState(false);

  // 현재 경로 확인 (간단한 방법으로 대체)
  const currentPath = window.location.pathname;

  // 마이페이지 관련 경로인지 확인
  const isMyPageRoute = currentPath.startsWith('/mypage');

  // 마이페이지 라우트일 때 자동으로 토글 열기
  useEffect(() => {
    if (isMyPageRoute) {
      setIsMyPageOpen(true);
    }
  }, [isMyPageRoute]);

  const menuItems = [
    { icon: Home, label: '홈', path: '/' },
    { icon: MessageSquareMore, label: '커뮤니티', isToggle: true, toggleKey: 'community' },
    { icon: FileText, label: '후기', path: '/community/review', parent: '커뮤니티' },
    { icon: Volume2, label: '공지사항', path: '/community/notice', parent: '커뮤니티' },
    { icon: HelpCircle, label: '문의내역', path: '/community/qna', parent: '커뮤니티' },
    { icon: User, label: '마이페이지', isToggle: true, toggleKey: 'mypage' },
    // 마이페이지 하위 메뉴들
    { icon: Edit3, label: '회원정보 수정', path: '/mypage/profile', parent: '마이페이지' },
    { icon: Trash2, label: '회원탈퇴', path: '/mypage/delete', parent: '마이페이지' },
    { icon: CreditCard, label: '결제내역 조회', path: '/mypage/payment', parent: '마이페이지' },
    { icon: MessageCircle, label: 'QnA 쓴 글 확인', path: '/mypage/qna', parent: '마이페이지' },
    { icon: PenTool, label: '커뮤니티 쓴 글 확인', path: '/mypage/community', parent: '마이페이지' },
    { icon: MapPin, label: '나만의 여행정보', isToggle: true, toggleKey: 'travelinfo', parent: '마이페이지' },
    // 나만의 여행정보 하위 메뉴들
    { icon: Calendar, label: '검색한 여행 계획', path: '/mypage/travel/search', parent: '나만의 여행정보' },
    { icon: MapPin, label: '내가 다녀온 여행 정보 관리', path: '/mypage/travel/history', parent: '나만의 여행정보' },
    { icon: Star, label: '즐겨찾기', path: '/favorites' },
  ];

  const handleToggle = (toggleKey) => {
    // eslint-disable-next-line default-case
    switch (toggleKey) {
      case 'community':
        setIsCommunityOpen(!isCommunityOpen);
        break;
      case 'mypage':
        if (!isMyPageRoute) {
          // 마이페이지가 아닌 곳에서 클릭시 마이페이지로 이동
          window.location.href = '/mypage';
        } else {
          // 마이페이지에서 클릭시 토글
          setIsMyPageOpen(!isMyPageOpen);
        }
        break;
      case 'travelinfo':
        setIsTravelInfoOpen(!isTravelInfoOpen);
        break;
    }
  };

  const isMenuVisible = (item) => {
    // 마이페이지 하위 메뉴들: 마이페이지 라우트이고 토글이 열려있을 때만 표시
    if (item.parent === '마이페이지') {
      return isMyPageRoute && isMyPageOpen && !isCollapsed;
    }

    // 나만의 여행정보 하위 메뉴들
    if (item.parent === '나만의 여행정보') {
      return isMyPageRoute && isMyPageOpen && isTravelInfoOpen && !isCollapsed;
    }

    // 커뮤니티 하위 메뉴들
    if (item.parent === '커뮤니티') {
      return !isCollapsed && isCommunityOpen;
    }

    // 일반 메뉴들 (마이페이지 버튼 포함)
    return true;
  };

  const getMenuItemClass = (item) => {
    let className = `nav-item ${isCollapsed ? 'collapsed' : 'expanded'}`;

    if (item.parent) {
      className += ' sub-item';
    }

    // 현재 경로와 일치하는 메뉴 활성화
    if (item.path && currentPath === item.path) {
      className += ' active';
    }

    return className;
  };

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
              if (!isMenuVisible(item)) return null;

              // 토글 버튼들
              if (item.isToggle) {
                const isOpen = item.toggleKey === 'community' ? isCommunityOpen :
                    item.toggleKey === 'mypage' ? isMyPageOpen :
                        item.toggleKey === 'travelinfo' ? isTravelInfoOpen : false;

                return (
                    <button
                        key={index}
                        onClick={() => handleToggle(item.toggleKey)}
                        className={getMenuItemClass(item)}
                    >
                      <item.icon className="nav-icon" />
                      <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                    {item.label}
                  </span>
                      {!isCollapsed && (
                          isOpen ? (
                              <ChevronUp className="nav-icon" />
                          ) : (
                              <ChevronDown className="nav-icon" />
                          )
                      )}
                    </button>
                );
              }

              // 일반 메뉴 버튼들
              return (
                  <button
                      key={index}
                      onClick={() => {
                        if (item.path) {
                          window.location.href = item.path;
                        }
                      }}
                      className={getMenuItemClass(item)}
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
