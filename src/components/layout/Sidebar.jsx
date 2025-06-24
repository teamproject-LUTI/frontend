import React, { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../../util/apiClient';
import { useAuth } from '../../util/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Settings,
  Heart,
  MapPin,
  CreditCard,
  UserMinus,
  MessageSquare,
  HeartPlus,
  MessageCircleQuestion,
  Shield,
  UserX,
  KeyRound
} from 'lucide-react';
import '../../styles/layout/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 아이콘 매핑
  const iconMap = {
    'Home': Home, 'MessageSquareMore': MessageSquareMore, 'FileText': FileText,
    'Volume2': Volume2, 'HelpCircle': HelpCircle, 'User': User,
    'Star': Star, 'Settings': Settings, 'Shield': Shield, 'Heart': Heart, 'MapPin': MapPin,
    'CreditCard': CreditCard, 'UserMinus': UserMinus, 'MessageSquare': MessageSquare,
    'HeartPlus': HeartPlus, 'MessageCircleQuestion': MessageCircleQuestion,'UserX':UserX,'KeyRound':KeyRound
  };

  // DB 메뉴를 사이드바 형식으로 변환
  const convertDbMenusToSidebarFormat = useCallback((dbMenus) => {
    if (!Array.isArray(dbMenus) || dbMenus.length === 0) return [];

    const convertMenu = (menu, level = 0) => {
      if (!menu) return null;

      const hasChildren = menu.children && Array.isArray(menu.children) && menu.children.length > 0;

      const converted = {
        id: menu.navigationMenuId,
        icon: menu.icon || 'FileText',
        label: menu.name || '이름 없음',
        path: menu.url || null,
        level: level,
        hasChildren: hasChildren,
        isToggle: hasChildren,
        isActive: menu.isActive !== false,
        order: menu.menuOrder || 0,
        description: menu.description,
        parentId: menu.parentId
      };

      if (hasChildren) {
        converted.children = menu.children
            .map(child => convertMenu(child, level + 1))
            .filter(Boolean);
      }

      return converted;
    };

    return dbMenus.map(menu => convertMenu(menu)).filter(Boolean);
  }, []);

  // 메뉴 데이터 로드
  const loadMenuData = useCallback(async () => {
    try {
      const timestamp = new Date().getTime();

      const response = await apiClient.get('/api/menus/hierarchy', {
        params: { _t: timestamp }
      });

      if (response.status !== 200) {
        console.error('응답 에러:', response.data);
        throw new Error(`메뉴 요청 실패: ${response.status} ${response.statusText}`);
      }

      const menuData = response.data;
      const dbMenus = menuData.data || menuData || [];
      const convertedMenus = convertDbMenusToSidebarFormat(dbMenus);
      setMenuItems(convertedMenus);

      return convertedMenus;

    } catch (error) {
      console.error('메뉴 데이터 로드 실패:', error);
      throw error;
    }
  }, [convertDbMenusToSidebarFormat]);

  // 사이드바 초기화
  const initializeSidebar = useCallback(async () => {
    if (authLoading) return; // AuthContext 로딩 중이면 대기

    try {
      setLoading(true);
      setError(null);
      setMenuItems([]);

      // AuthContext에서 사용자 정보 가져오기
      if (isAuthenticated && user) {
        setIsAdmin(user.userTypeId === 2);
      }

      // 메뉴 데이터 로드
      try {
        await loadMenuData();
      } catch (menuError) {
        console.error('메뉴 로드 실패:', menuError);
        setError(`메뉴 로드 실패: ${menuError.message}`);
      }

    } catch (err) {
      console.error('사이드바 초기화 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading, loadMenuData]);

  // 메뉴 업데이트 이벤트 리스너
  useEffect(() => {
    const handleMenuUpdate = async (event) => {
      try {
        setTimeout(async () => {
          try {
            await loadMenuData();
          } catch (error) {
            console.error('Sidebar: 지연된 메뉴 새로고침 실패:', error);
          }
        }, 100);
      } catch (error) {
        console.error('Sidebar: 메뉴 새로고침 실패:', error);
      }
    };

    window.addEventListener('menuUpdated', handleMenuUpdate);
    document.addEventListener('menuUpdated', handleMenuUpdate);

    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdate);
      document.removeEventListener('menuUpdated', handleMenuUpdate);
    };
  }, [loadMenuData]);

  // AuthContext 상태 변경 시 초기화
  useEffect(() => {
    if (!authLoading) {
      initializeSidebar();
    }
  }, [initializeSidebar, authLoading]);

  // 현재 경로에 따른 활성 메뉴 설정
  useEffect(() => {
    const findActiveMenu = (items, currentPath) => {
      for (const item of items) {
        if (item.path === currentPath) return item.id;
        if (item.children) {
          const foundId = findActiveMenu(item.children, currentPath);
          if (foundId) {
            setExpandedItems(prev => new Set(prev).add(item.id));
            return foundId;
          }
        }
      }
      return null;
    };

    if (menuItems.length > 0) {
      const activeId = findActiveMenu(menuItems, location.pathname);
      setActiveMenuId(activeId);
    }
  }, [menuItems, location.pathname]);

  // 메뉴 토글
  const toggleExpand = (menuId) => {
    setExpandedItems(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(menuId)) {
        newExpanded.delete(menuId);
      } else {
        newExpanded.add(menuId);
      }
      return newExpanded;
    });
  };

  // 메뉴 클릭 처리
  const handleNavClick = (path, menuId) => {
    if (path) {
      setActiveMenuId(menuId);
      navigate(path);
    }
  };

  // 메뉴 아이템 렌더링
  const renderMenuItem = (item) => {
    if (!item || (!isAdmin && item.isActive === false)) {
      return null;
    }

    const IconComponent = iconMap[item.icon] || FileText;
    const isExpanded = expandedItems.has(item.id);
    const isActive = activeMenuId === item.id;

    return (
        <div key={item.id} className="menu-item-wrapper">
          {item.isToggle ? (
              <button
                  onClick={() => toggleExpand(item.id)}
                  className={`nav-item ${isCollapsed ? 'collapsed' : ''} ${isExpanded ? 'toggle-active' : ''} ${!item.isActive ? 'inactive' : ''}`}
              >
                <IconComponent className="nav-icon"/>
                <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                  {item.label}
                  {isAdmin && !item.isActive && <span className="inactive-badge">(비활성)</span>}
                </span>
                {!isCollapsed && (isExpanded ? <ChevronUp className="nav-icon toggle-icon"/> :
                    <ChevronDown className="nav-icon toggle-icon"/>)}
              </button>
          ) : (
              <button
                  onClick={() => handleNavClick(item.path, item.id)}
                  className={`nav-item ${isCollapsed ? 'collapsed' : ''} ${item.level > 0 ? 'sub-item' : ''} ${isActive ? 'active' : ''} ${!item.isActive ? 'inactive' : ''}`}
                  style={{ paddingLeft: isCollapsed ? undefined : `${1 + item.level * 1}rem` }}
              >
                <IconComponent className="nav-icon"/>
                <span className={`nav-label ${isCollapsed ? 'hidden' : ''}`}>
                  {item.label}
                  {isAdmin && !item.isActive && <span className="inactive-badge">(비활성)</span>}
                </span>
              </button>
          )}
          {item.hasChildren && isExpanded && !isCollapsed && (
              <div className="sub-menu-container">
                {item.children.map(renderMenuItem)}
              </div>
          )}
        </div>
    );
  };

  // 로딩 상태
  if (authLoading || loading) {
    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
          <div className="sidebar-content">
            <div className="sidebar-loading">
              <div className="loading-spinner"></div>
              {!isCollapsed && <span>메뉴 로딩 중...</span>}
            </div>
          </div>
        </aside>
    );
  }

  // 에러 상태
  if (error) {
    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
          <div className="sidebar-content">
            <div className="sidebar-error">
              <p>메뉴 로드 오류</p>
              {!isCollapsed && (
                  <>
                    <p className="error-detail">{error}</p>
                    <button onClick={initializeSidebar} className="retry-btn">다시 시도</button>
                  </>
              )}
            </div>
          </div>
        </aside>
    );
  }

  const sortedMenuItems = [...menuItems].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isAdmin ? 'admin-mode' : 'user-mode'}`}>
        <div className="sidebar-content">
          <div className="toggle-section">
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="toggle-btn"
                title={isCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
            >
              <Menu className="toggle-icon"/>
            </button>
          </div>

          <nav className="sidebar-nav">
            {sortedMenuItems.length > 0 ? sortedMenuItems.map(renderMenuItem) : (
                <div className="no-menus">
                  {!isCollapsed && <span>표시할 메뉴가 없습니다.</span>}
                </div>
            )}
          </nav>
        </div>
      </aside>
  );
};

export default Sidebar;
