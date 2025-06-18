import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
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
  Shield
} from 'lucide-react';
import { useAuth } from '../../util/AuthContext';
import '../../styles/layout/Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    // 아이콘 매핑
    const iconMap = {
        'Home': Home, 'MessageSquareMore': MessageSquareMore, 'FileText': FileText,
        'Volume2': Volume2, 'HelpCircle': HelpCircle, 'User': User,
        'Star': Star, 'Settings': Settings, 'Shield': Shield
    };

    // 쿠키에서 토큰 가져오기
    const getTokenFromCookie = () => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'accessToken') {
                return value;
            }
        }
        return null;
    };

    // API 요청 헤더 생성 (쿠키 기반이므로 헤더에 토큰 불필요)
    const createRequestHeaders = () => {
        return {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        };
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

    // 사용자 인증 상태 확인
    const checkUserAuth = async () => {
        try {
            console.log('🔐 사용자 인증 상태 확인 시작');
            console.log('🍪 현재 쿠키:', document.cookie);

            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: createRequestHeaders(),
                credentials: 'include' // 쿠키 자동 포함
            });

            console.log('🔐 인증 응답 상태:', response.status);

            if (response.ok) {
                const userData = await response.json();
                console.log('✅ 인증 성공:', userData);
                setIsAuthenticated(true);
                const userIsAdmin = userData.userTypeId === 2;
                setIsAdmin(userIsAdmin);
                return { isAuthenticated: true, isAdmin: userIsAdmin };
            } else {
                console.log('❌ 인증 실패 또는 토큰 만료');
                setIsAuthenticated(false);
                setIsAdmin(false);
                return { isAuthenticated: false, isAdmin: false };
            }
        } catch (error) {
            console.error('❌ 사용자 인증 확인 실패:', error);
            setIsAuthenticated(false);
            setIsAdmin(false);
            return { isAuthenticated: false, isAdmin: false };
        }
    };

    // 메뉴 데이터 로드 (중복 호출 방지)
    const loadMenuData = async () => {
        try {
            const timestamp = new Date().getTime();
            const endpoint = `${API_BASE_URL}/api/menus/hierarchy?_t=${timestamp}`;

            console.log(`📡 메뉴 요청 시작`);
            console.log(`📍 URL: ${endpoint}`);
            console.log(`🍪 요청 쿠키:`, document.cookie);
            console.log(`🔧 요청 헤더:`, createRequestHeaders());

            const response = await fetch(endpoint, {
                headers: createRequestHeaders(),
                credentials: 'include', // 쿠키 자동 포함
                cache: 'no-store'
            });

            console.log(`📤 응답 상태: ${response.status} ${response.statusText}`);
            console.log(`📤 응답 헤더:`, [...response.headers.entries()]);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ 응답 에러 내용:`, errorText);
                throw new Error(`메뉴 요청 실패: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const menuData = await response.json();

            // SingleResponseDto 구조 처리
            const dbMenus = menuData.data || menuData || [];
            console.log('📋 받은 메뉴 데이터:', dbMenus.length, '개');

            const convertedMenus = convertDbMenusToSidebarFormat(dbMenus);
            setMenuItems(convertedMenus);

            return convertedMenus;

        } catch (error) {
            console.error('❌ 메뉴 데이터 로드 실패:', error);
            throw error;
        }
    };

    // 사이드바 초기화 (useRef로 중복 호출 방지)
    const initializingRef = useRef(false);

    const initializeSidebar = useCallback(async () => {
        // 이미 초기화 중이면 리턴
        if (initializingRef.current) {
            console.log('이미 초기화 중입니다. 중복 호출 방지');
            return;
        }

        try {
            initializingRef.current = true;
            setLoading(true);
            setError(null);
            setMenuItems([]);

            console.log('🚀 사이드바 초기화 시작');

            // 0. 백엔드 연결 테스트
            try {
                const testResponse = await fetch(`${API_BASE_URL}/api/menus/test`, {
                    credentials: 'include'
                });
                console.log('🧪 백엔드 테스트 응답:', testResponse.status, await testResponse.text());
            } catch (testError) {
                console.error('❌ 백엔드 연결 실패:', testError);
            }

            // 1. 사용자 인증 상태 확인
            const authResult = await checkUserAuth();

            // 2. 메뉴 데이터 로드 (인증 여부와 관계없이 시도)
            console.log('📋 메뉴 데이터 로드 시도 (인증 상태:', authResult.isAuthenticated, ')');
            try {
                await loadMenuData();
            } catch (menuError) {
                console.error('❌ 메뉴 로드 실패, 인증 문제일 수 있음:', menuError);
                setError(`메뉴 로드 실패: ${menuError.message}`);
            }

            console.log('✅ 사이드바 초기화 완료');

        } catch (err) {
            console.error('❌ 사이드바 초기화 실패:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            initializingRef.current = false;
        }
    }, [API_BASE_URL]);

    // 컴포넌트 마운트 시 한 번만 초기화
    useEffect(() => {
        initializeSidebar();
    }, []); // 빈 의존성 배열로 한 번만 실행

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
                        style={{paddingLeft: isCollapsed ? undefined : `${1 + item.level * 1}rem`}}
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
    if (loading) {
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
                    {/*{!isCollapsed && (*/}
                    {/*    <div className={`auth-badge ${isAdmin ? 'admin' : isAuthenticated ? 'user' : 'guest'}`}>*/}
                    {/*        <Shield className="auth-icon"/>*/}
                    {/*        <span>{isAdmin ? '관리자' : isAuthenticated ? '사용자' : '방문자'}</span>*/}
                    {/*    </div>*/}
                    {/*)}*/}
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
