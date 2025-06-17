import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  MessageSquareMore,
  FileText,
  Volume2,
  HelpCircle,
  User,
  Star,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Menu,
  Settings,
  Heart,
  MapPin,
  UserMinus
} from 'lucide-react';
import { useAuth } from '../../util/AuthContext';
import '../../styles/layout/Sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(true);
  const [isMypageOpen, setIsMypageOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 현재 경로가 마이페이지 관련이면 자동으로 토글 열기
  useEffect(() => {
    if (location.pathname.startsWith('/mypage')) {
      setIsMypageOpen(true);
    }
  }, [location.pathname]);

  // 소셜 로그인 사용자인지 확인
  const isSocialUser = () => {
    return user?.provider && user.provider !== 'LOCAL';
  };

  // 회원탈퇴 클릭 처리
  const handleWithdrawClick = () => {
    if (isSocialUser()) {
      // 소셜 로그인 사용자는 바로 탈퇴 페이지로
      navigate('/mypage/withdraw');
    } else {
      // 일반 로그인 사용자는 비밀번호 확인 페이지로
      navigate('/mypage/withdraw/confirm');
    }
  };

  const menuItems = [
    { icon: Home, label: '홈', path: '/main' },
    { icon: MessageSquareMore, label: '커뮤니티', isToggle: true, toggleKey: 'community' },
    { icon: FileText, label: '후기', path: '/community/review', parent: '커뮤니티' },
    { icon: Volume2, label: '공지사항', path: '/community/notice', parent: '커뮤니티' },
    { icon: HelpCircle, label: '문의내역', path: '/community/qna', parent: '커뮤니티' },
    {
      icon: User,
      label: '마이페이지',
      isToggle: true,
      toggleKey: 'mypage',
      path: '/mypage'
    },
    { icon: Settings, label: '개인정보 수정', path: '/mypage/profile', parent: '마이페이지' },
    {
      icon: UserMinus,
      label: '회원탈퇴',
      action: 'withdraw',
      parent: '마이페이지'
    },
    { icon: Heart, label: '찜한 여행지', path: '/mypage/favorites', parent: '마이페이지' },
    { icon: MapPin, label: '여행 기록', path: '/mypage/travel-history', parent: '마이페이지' },
    { icon: CreditCard, label: '결제 내역', path: '/mypage/payments', parent: '마이페이지' },
    { icon: Star, label: '즐겨찾기', path: '/favorites' },
    { icon: CreditCard, label: '결제내역', path: '/payment' },
  ];

  const handleToggle = (toggleKey) => {
    if (toggleKey === 'community') {
      setIsCommunityOpen(!isCommunityOpen);
    } else if (toggleKey === 'mypage') {
      setIsMypageOpen(!isMypageOpen);
      navigate('/mypage');
    }
  };

  const handleMenuClick = (item) => {
    if (item.isToggle) {
      handleToggle(item.toggleKey);
    } else if (item.action === 'withdraw') {
      handleWithdrawClick();
    } else if (item.path) {
      navigate(item.path);
    }
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
              // 토글 버튼들
              if (item.isToggle) {
                const isOpen = item.toggleKey === 'community' ? isCommunityOpen : isMypageOpen;
                const isActive = item.toggleKey === 'mypage' && location.pathname.startsWith('/mypage');

                return (
                    <button
                        key={index}
                        onClick={() => handleMenuClick(item)}
                        className={`nav-item ${isCollapsed ? 'collapsed' : 'expanded'} ${isActive ? 'active' : ''}`}
                    >
                      <item.icon className="nav-icon" />
                      <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                    {item.label}
                  </span>
                      {!isCollapsed &&
                          (isOpen ? (
                              <ChevronUp className="nav-icon" />
                          ) : (
                              <ChevronDown className="nav-icon" />
                          ))}
                    </button>
                );
              }

              // 하위 메뉴 처리
               // 하위 메뉴인데 사이드바가 닫혀있거나, 토글이 닫혀있으면 숨김
              if (item.parent === '커뮤니티') {
                if (isCollapsed || !isCommunityOpen) return null;
              }

              if (item.parent === '마이페이지') {
                if (isCollapsed || !isMypageOpen) return null;
              }

              // 기본 메뉴 출력
              return (
                  <Link
                to={item.path}
                key={index}
                className={`nav-item ${isCollapsed ? 'collapsed' : 'expanded'} ${
                  item.parent ? 'sub-item' : ''
                }`}
              >
                <item.icon className="nav-icon" />
                <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                  {item.label}
                </span>
              </Link>
              );
            })}
          </nav>
        </div>
      </aside>
  );
};

export default Sidebar;
