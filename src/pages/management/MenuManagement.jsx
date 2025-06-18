import Layout from '../../components/layout/Layout';
import React, { useState, useEffect } from 'react';
import {
    Plus, Edit2, Trash2, ChevronRight, ChevronDown, Save, X,
    Home, MessageSquareMore, FileText, Volume2, HelpCircle, User,
    Star, Settings, Shield, Heart, MapPin, CreditCard, UserMinus,
    MessageSquare, HeartPlus, MessageCircleQuestion
} from 'lucide-react';
import Swal from 'sweetalert2';
// import '올바른/경로/MenuManagement.css';

const MenuManagement = () => {
    // 아이콘 매핑
    const iconMap = {
        'Home': Home,
        'MessageSquareMore': MessageSquareMore,
        'FileText': FileText,
        'Volume2': Volume2,
        'HelpCircle': HelpCircle,
        'User': User,
        'Star': Star,
        'Settings': Settings,
        'Shield': Shield,
        'Heart': Heart,
        'MapPin': MapPin,
        'CreditCard': CreditCard,
        'UserMinus': UserMinus,
        'MessageSquare': MessageSquare,
        'HeartPlus': HeartPlus,
        'MessageCircleQuestion': MessageCircleQuestion
    };

    // 아이콘 렌더링 함수
    const renderIcon = (iconName, size = 16) => {
        const IconComponent = iconMap[iconName];
        if (IconComponent) {
            return <IconComponent size={size} />;
        }
        return iconName ? <span>{iconName}</span> : null;
    };

    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        url: '',
        icon: '',
        parentId: null,
        menuOrder: 1,
        isActive: true,
        level: 0,
        requiredRole: 1
    });

    // 쿠키 기반 API 호출 공통 설정
    const apiRequest = async (url, options = {}) => {
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        return fetch(url, defaultOptions);
    };

    // DB에서 메뉴 데이터 로드
    const loadMenus = async () => {
        try {
            setLoading(true);
            const timestamp = new Date().getTime();
            const baseUrl = process.env.NODE_ENV === 'development'
                ? 'http://localhost:8080'
                : '';
            const endpoint = `${baseUrl}/api/menus/admin/all?_t=${timestamp}`;

            console.log('API 호출 URL:', endpoint);

            const response = await apiRequest(endpoint);

            if (response.status === 401) {
                throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
            }

            if (response.status === 403) {
                throw new Error('관리자 권한이 필요합니다.');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('받은 응답:', text.substring(0, 200));
                throw new Error('서버에서 JSON이 아닌 응답을 반환했습니다.');
            }

            const data = await response.json();
            console.log('메뉴 데이터:', data);

            let menuData;
            if (data && Array.isArray(data)) {
                menuData = data;
            } else if (data && data.data && Array.isArray(data.data)) {
                menuData = data.data;
            } else {
                console.error('예상하지 못한 데이터 구조:', data);
                menuData = [];
            }

            console.log('처리된 메뉴 데이터:', menuData);
            setMenus(menuData);

            // 상위 메뉴들을 기본으로 펼쳐놓기
            const topLevelMenus = menuData.filter(menu => {
                const isTopLevel = menu.parentId === null || menu.parentId === undefined || menu.parentId === 0;
                return isTopLevel && menu.hasChildren;
            });
            setExpandedItems(new Set(topLevelMenus.map(menu => menu.navigationMenuId)));

        } catch (error) {
            console.error('메뉴 로드 실패:', error);
            setMenus([]);

            if (error.message.includes('인증이 필요합니다')) {
                Swal.fire({
                    icon: 'warning',
                    title: '인증 필요',
                    text: error.message,
                    confirmButtonText: '로그인 페이지로',
                }).then(() => {
                    window.location.href = '/login';
                });
                return;
            }

            if (error.message.includes('관리자 권한')) {
                Swal.fire({
                    icon: 'error',
                    title: '권한 부족',
                    text: error.message,
                });
                return;
            }

            let errorMessage = '메뉴 데이터를 불러오는데 실패했습니다.';
            if (error.message.includes('HTTP error')) {
                errorMessage = `서버 오류: ${error.message}`;
            } else if (error.message.includes('JSON')) {
                errorMessage = '서버 응답 형식이 올바르지 않습니다.';
            } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
            }

            Swal.fire({
                icon: 'error',
                title: '메뉴 로드 오류',
                text: errorMessage,
                footer: `API URL: /api/menus/admin/all`
            });
        } finally {
            setLoading(false);
        }
    };

    // 메뉴 추가/수정
    const handleSaveMenu = async () => {
        if (!formData.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: '입력 오류',
                text: '메뉴명을 입력해주세요.'
            });
            return;
        }

        try {
            const timestamp = new Date().getTime();
            const baseUrl = process.env.NODE_ENV === 'development'
                ? 'http://localhost:8080'
                : '';

            const url = editingMenu
                ? `${baseUrl}/api/menus/${editingMenu.navigationMenuId}?_t=${timestamp}`
                : `${baseUrl}/api/menus?_t=${timestamp}`;

            const method = editingMenu ? 'PUT' : 'POST';

            const menuData = {
                name: formData.name,
                description: formData.description,
                url: formData.url,
                icon: formData.icon,
                parentId: formData.parentId,
                level: formData.level,
                menuOrder: formData.menuOrder,
                isActive: formData.isActive,
                requiredRole: formData.requiredRole
            };

            console.log('저장 요청:', method, url, menuData);

            const response = await apiRequest(url, {
                method,
                body: JSON.stringify(menuData),
            });

            if (response.status === 401) {
                throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
            }

            if (response.status === 403) {
                throw new Error('관리자 권한이 필요합니다.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('서버 응답 오류:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await loadMenus();
            closeModal();
            Swal.fire({
                icon: 'success',
                title: '성공',
                text: editingMenu ? '메뉴가 수정되었습니다.' : '메뉴가 추가되었습니다.'
            });

        } catch (error) {
            console.error('저장 오류:', error);

            if (error.message.includes('인증이 필요합니다')) {
                Swal.fire({
                    icon: 'warning',
                    title: '인증 필요',
                    text: error.message,
                    confirmButtonText: '로그인 페이지로',
                }).then(() => {
                    window.location.href = '/login';
                });
                return;
            }

            Swal.fire({
                icon: 'error',
                title: '저장 오류',
                text: `저장 중 오류가 발생했습니다: ${error.message}`
            });
        }
    };

    // 메뉴 삭제
    const handleDeleteMenu = async (menuId) => {
        const menuToDelete = menus.find(m => m.navigationMenuId === menuId);
        const hasChildren = menus.some(m => m.parentId === menuId);

        let confirmMessage = '정말로 삭제하시겠습니까?';
        if (hasChildren) {
            confirmMessage = '이 메뉴에는 하위 메뉴가 있습니다. 하위 메뉴도 함께 삭제됩니다. 계속하시겠습니까?';
        }

        const result = await Swal.fire({
            title: '삭제 확인',
            text: confirmMessage,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        });

        if (!result.isConfirmed) return;

        try {
            const timestamp = new Date().getTime();
            const baseUrl = process.env.NODE_ENV === 'development'
                ? 'http://localhost:8080'
                : '';
            const deleteUrl = `${baseUrl}/api/menus/${menuId}?_t=${timestamp}`;

            console.log('삭제 요청:', deleteUrl);

            const response = await apiRequest(deleteUrl, {
                method: 'DELETE',
            });

            if (response.status === 401) {
                throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
            }

            if (response.status === 403) {
                throw new Error('관리자 권한이 필요합니다.');
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('삭제 응답 오류:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await loadMenus();
            Swal.fire({
                icon: 'success',
                title: '삭제 완료',
                text: '메뉴가 삭제되었습니다.'
            });

        } catch (error) {
            console.error('삭제 오류:', error);

            if (error.message.includes('인증이 필요합니다')) {
                Swal.fire({
                    icon: 'warning',
                    title: '인증 필요',
                    text: error.message,
                    confirmButtonText: '로그인 페이지로',
                }).then(() => {
                    window.location.href = '/login';
                });
                return;
            }

            Swal.fire({
                icon: 'error',
                title: '삭제 오류',
                text: `삭제 중 오류가 발생했습니다: ${error.message}`
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMenu(null);
        setFormData({
            name: '',
            description: '',
            url: '',
            icon: '',
            parentId: null,
            menuOrder: 1,
            isActive: true,
            level: 0,
            requiredRole: 1
        });
    };

    const toggleExpand = (menuId) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(menuId)) {
            newExpanded.delete(menuId);
        } else {
            newExpanded.add(menuId);
        }
        setExpandedItems(newExpanded);
    };

    const addSubMenu = (parentMenu) => {
        const nextOrder = parentMenu.children ? Math.max(...parentMenu.children.map(c => c.menuOrder), 0) + 1 : 1;
        openModal(null, parentMenu.navigationMenuId, parentMenu.level + 1, nextOrder);
    };

    const openModal = (menu = null, parentId = null, level = 0, order = 1) => {
        setEditingMenu(menu);
        if (menu) {
            setFormData({
                name: menu.name || '',
                description: menu.description || '',
                url: menu.url || '',
                icon: menu.icon || '',
                parentId: menu.parentId,
                level: menu.level || 0,
                menuOrder: menu.menuOrder || 1,
                requiredRole: menu.requiredRole || 1,
                isActive: menu.isActive !== undefined ? menu.isActive : true
            });
        } else {
            const nextOrder = parentId
                ? order
                : Math.max(...menus.filter(m => !m.parentId).map(m => m.menuOrder), 0) + 1;

            setFormData({
                name: '',
                description: '',
                url: '',
                icon: '',
                parentId: parentId,
                level: level,
                menuOrder: nextOrder,
                requiredRole: 1,
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    // 🔥 수정된 buildMenuTree 함수
    const buildMenuTree = (menus) => {
        console.log('=== buildMenuTree 디버깅 시작 ===');
        console.log('입력 메뉴 데이터:', menus);

        if (!Array.isArray(menus) || menus.length === 0) {
            console.log('메뉴 데이터가 비어있거나 배열이 아님');
            return [];
        }

        const menuMap = {};
        const tree = [];

        // 1단계: 메뉴 맵 생성
        menus.forEach(menu => {
            console.log(`메뉴 맵 생성: ${menu.name}, ID: ${menu.navigationMenuId}, parentId: ${menu.parentId}`);
            menuMap[menu.navigationMenuId] = { ...menu, children: [] };
        });

        console.log('생성된 메뉴 맵:', menuMap);

        // 2단계: 트리 구조 구성
        menus.forEach(menu => {
            // 🔥 수정된 최상위 메뉴 판별 로직
            const isTopLevel = (
                menu.parentId === null ||
                menu.parentId === undefined ||
                menu.parentId === 0 ||
                menu.parentId === '' ||
                menu.parentId === 'null'
            );

            console.log(`트리 구성: ${menu.name} (ID: ${menu.navigationMenuId}) - parentId: "${menu.parentId}" (타입: ${typeof menu.parentId}) - 최상위? ${isTopLevel}`);

            if (isTopLevel) {
                console.log(`✅ 최상위 메뉴로 추가: ${menu.name}`);
                tree.push(menuMap[menu.navigationMenuId]);
            } else {
                console.log(`하위 메뉴 처리: ${menu.name} -> 부모ID: ${menu.parentId}`);

                // 부모 메뉴가 존재하는지 확인
                if (menuMap[menu.parentId]) {
                    console.log(`✅ 부모 메뉴 찾음: ${menuMap[menu.parentId].name} -> 자식 추가: ${menu.name}`);
                    menuMap[menu.parentId].children.push(menuMap[menu.navigationMenuId]);
                } else {
                    console.log(`❌ 부모 메뉴를 찾을 수 없음 (parentId: ${menu.parentId}). 최상위로 처리: ${menu.name}`);
                    // 부모를 찾을 수 없으면 최상위 메뉴로 처리
                    tree.push(menuMap[menu.navigationMenuId]);
                }
            }
        });

        console.log('트리 구성 완료:', tree);

        // 3단계: 메뉴 순서로 정렬
        const sortByOrder = (items) => {
            items.sort((a, b) => (a.menuOrder || 0) - (b.menuOrder || 0));
            items.forEach(item => {
                if (item.children && item.children.length > 0) {
                    sortByOrder(item.children);
                }
            });
        };

        sortByOrder(tree);
        console.log('=== 최종 정렬된 트리 ===:', tree);
        console.log('최상위 메뉴 개수:', tree.length);

        return tree;
    };

    const renderMenuItem = (menu, level = 0) => {
        const hasChildren = menu.children && menu.children.length > 0;
        const isExpanded = expandedItems.has(menu.navigationMenuId);

        return (
            <div key={menu.navigationMenuId} className="menu-item" style={{
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                marginBottom: '8px',
                padding: '12px',
                backgroundColor: level > 0 ? '#f8f9fa' : '#fff'
            }}>
                <div className="menu-item-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="menu-item-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {hasChildren && (
                            <button
                                onClick={() => toggleExpand(menu.navigationMenuId)}
                                className="expand-btn"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}
                            >
                                {isExpanded ?
                                    <ChevronDown size={16} /> :
                                    <ChevronRight size={16} />
                                }
                            </button>
                        )}
                        {!hasChildren && <div style={{ width: '24px' }}></div>}

                        <div className="menu-info">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {menu.icon && (
                                    <span className="menu-icon" style={{ display: 'flex', alignItems: 'center' }}>
                                        {renderIcon(menu.icon, 18)}
                                    </span>
                                )}
                                <div>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{menu.name}</span>
                                    {menu.description && (
                                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                            {menu.description}
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {!menu.isActive && (
                                        <span style={{
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            backgroundColor: '#ffc107',
                                            color: '#000',
                                            borderRadius: '4px'
                                        }}>비활성</span>
                                    )}
                                    {menu.requiredRole === 2 && (
                                        <span style={{
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            backgroundColor: '#dc3545',
                                            color: '#fff',
                                            borderRadius: '4px'
                                        }}>관리자</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="menu-item-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '8px' }}>
                            <span>L{menu.level}</span>
                            <span>#{menu.menuOrder}</span>
                            {menu.url && (
                                <span style={{ fontFamily: 'monospace' }}>{menu.url}</span>
                            )}
                        </div>

                        {/* 하위 메뉴 추가 버튼: 최상위 메뉴이면서 하위 메뉴가 없는 경우에만 표시 */}
                        {level === 0 && !hasChildren && (
                            <button
                                onClick={() => addSubMenu(menu)}
                                style={{
                                    padding: '6px',
                                    border: 'none',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                                title="하위 메뉴 추가"
                            >
                                <Plus size={14} />
                            </button>
                        )}

                        <button
                            onClick={() => openModal(menu)}
                            style={{
                                padding: '6px',
                                border: 'none',
                                backgroundColor: '#007bff',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            title="수정"
                        >
                            <Edit2 size={14} />
                        </button>

                        <button
                            onClick={() => handleDeleteMenu(menu.navigationMenuId)}
                            style={{
                                padding: '6px',
                                border: 'none',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                            title="삭제"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div style={{ marginTop: '12px', marginLeft: '20px' }}>
                        {menu.children.map(child => renderMenuItem(child, level + 1))}
                        <div style={{ marginTop: '8px' }}>
                            <button
                                onClick={() => addSubMenu(menu)}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px dashed #ccc',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Plus size={16} />
                                <span>하위 메뉴 추가</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const getParentOptions = () => {
        const options = [{ value: null, label: '최상위 메뉴' }];

        const addMenuOptions = (menuList, prefix = '') => {
            menuList.forEach(menu => {
                options.push({
                    value: menu.navigationMenuId,
                    label: `${prefix}${menu.name}`
                });
                if (menu.children && menu.children.length > 0) {
                    addMenuOptions(menu.children, `${prefix}${menu.name} > `);
                }
            });
        };

        addMenuOptions(buildMenuTree(menus));
        return options;
    };

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            if (mounted) {
                await loadMenus();
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, []);

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div>로딩 중...</div>
            </div>
        );
    }

    const menuTree = buildMenuTree(menus);

    return (
        <Layout>
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <h1 style={{ margin: '0 0 8px 0', fontSize: '24px' }}>네비게이션 메뉴 관리</h1>
                            <p style={{ margin: 0, color: '#666' }}>총 {menus.length}개의 메뉴가 등록되어 있습니다</p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            style={{
                                padding: '12px 16px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Plus size={20} />
                            <span>최상위 메뉴 추가</span>
                        </button>
                    </div>

                    <div>
                        {menuTree.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px',
                                border: '2px dashed #ccc',
                                borderRadius: '8px'
                            }}>
                                <div style={{ marginBottom: '16px', fontSize: '16px', color: '#666' }}>
                                    등록된 메뉴가 없습니다.
                                </div>
                                <button
                                    onClick={() => openModal()}
                                    style={{
                                        padding: '12px 16px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Plus size={16} />
                                    <span>첫 번째 메뉴 추가하기</span>
                                </button>
                            </div>
                        ) : (
                            <div>
                                {menuTree.map(menu => renderMenuItem(menu))}
                                <div style={{ marginTop: '16px' }}>
                                    <button
                                        onClick={() => openModal()}
                                        style={{
                                            padding: '12px 16px',
                                            border: '2px dashed #007bff',
                                            backgroundColor: 'transparent',
                                            color: '#007bff',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            width: '100%',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Plus size={16} />
                                        <span>최상위 메뉴 추가</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {isModalOpen && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                padding: '24px',
                                width: '90%',
                                maxWidth: '600px',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}>
                                <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
                                    {editingMenu ? '메뉴 수정' : '메뉴 추가'}
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>메뉴명 *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                            placeholder="메뉴명을 입력하세요"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>설명</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                            placeholder="메뉴 설명을 입력하세요"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>URL</label>
                                        <input
                                            type="text"
                                            value={formData.url}
                                            onChange={(e) => setFormData({...formData, url: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                            placeholder="/path/to/page"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>아이콘</label>
                                        <select
                                            value={formData.icon}
                                            onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="">아이콘 선택</option>
                                            {Object.keys(iconMap).map(iconName => (
                                                <option key={iconName} value={iconName}>
                                                    {iconName}
                                                </option>
                                            ))}
                                        </select>
                                        {formData.icon && (
                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span>미리보기:</span>
                                                {renderIcon(formData.icon, 20)}
                                                <span>{formData.icon}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>상위 메뉴</label>
                                        <select
                                            value={formData.parentId || ''}
                                            onChange={(e) => {
                                                const parentId = e.target.value === '' ? null : parseInt(e.target.value);
                                                const parentMenu = menus.find(m => m.navigationMenuId === parentId);
                                                setFormData({
                                                    ...formData,
                                                    parentId: parentId,
                                                    level: parentId ? (parentMenu?.level || 0) + 1 : 0
                                                });
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {getParentOptions().map(option => (
                                                <option key={option.value || 'null'} value={option.value || ''}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>메뉴 순서</label>
                                            <input
                                                type="number"
                                                value={formData.menuOrder}
                                                onChange={(e) => setFormData({...formData, menuOrder: parseInt(e.target.value) || 1})}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                                min="1"
                                            />
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>필요 권한</label>
                                            <select
                                                value={formData.requiredRole || 1}
                                                onChange={(e) => setFormData({...formData, requiredRole: parseInt(e.target.value)})}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                <option value={1}>일반사용자</option>
                                                <option value={2}>관리자</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            />
                                            활성화
                                        </label>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                                    <button
                                        onClick={closeModal}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            border: '1px solid #ccc',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <X size={16} />
                                        <span>취소</span>
                                    </button>
                                    <button
                                        onClick={handleSaveMenu}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            border: 'none',
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Save size={16} />
                                        <span>저장</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MenuManagement;