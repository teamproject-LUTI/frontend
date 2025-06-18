import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Move, Eye, EyeOff, Save, X } from 'lucide-react';

const MenuManagement = () => {
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
        parent_id: null,
        menu_level: 1,
        menu_order: 1,
        required_role: 1,
        is_active: true,
        has_children: false
    });

    // DB에서 메뉴 데이터 로드
    const loadMenus = async () => {
        try {
            setLoading(true);
            // API 호출 예시
            const response = await fetch('/api/menus/admin/all');
            const data = await response.json();
            setMenus(data);

            // 상위 메뉴들을 기본으로 펼쳐놓기
            const topLevelMenus = data.filter(menu => menu.parent_id === null && menu.has_children);
            setExpandedItems(new Set(topLevelMenus.map(menu => menu.navigationMenuId)));
        } catch (error) {
            console.error('메뉴 로드 실패:', error);
            // 에러 발생 시 빈 배열로 설정
            setMenus([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMenus();
    }, []);

    // 트리 구조로 메뉴 정렬
    const buildMenuTree = (menus) => {
        const menuMap = {};
        const tree = [];

        // 메뉴 맵 생성
        menus.forEach(menu => {
            menuMap[menu.navigationMenuId] = { ...menu, children: [] };
        });

        // 트리 구조 구성
        menus.forEach(menu => {
            if (menu.parent_id === null) {
                tree.push(menuMap[menu.navigationMenuId]);
            } else if (menuMap[menu.parent_id]) {
                menuMap[menu.parent_id].children.push(menuMap[menu.navigationMenuId]);
            }
        });

        // 메뉴 순서로 정렬
        const sortByOrder = (items) => {
            items.sort((a, b) => a.menu_order - b.menu_order);
            items.forEach(item => {
                if (item.children.length > 0) {
                    sortByOrder(item.children);
                }
            });
        };

        sortByOrder(tree);
        return tree;
    };

    // 메뉴 추가/수정
    const handleSaveMenu = async () => {
        try {
            const url = editingMenu
                ? `/api/navigationMenus/${editingMenu.navigationMenuId}`
                : '/api/navigationMenus';

            const method = editingMenu ? 'PUT' : 'POST';

            const menuData = {
                ...formData,
                updated_at: new Date().toISOString(),
                updated_by: 1, // 현재 사용자 ID
                ...(editingMenu ? {} : {
                    created_at: new Date().toISOString(),
                    created_by: 1
                })
            };

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(menuData),
            });

            if (response.ok) {
                await loadMenus(); // 메뉴 다시 로드
                closeModal();
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('저장 오류:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    // 메뉴 삭제 (하위 메뉴 확인 포함)
    const handleDeleteMenu = async (menuId) => {
        const menuToDelete = menus.find(m => m.navigationMenuId === menuId);
        const hasChildren = menus.some(m => m.parent_id === menuId);

        let confirmMessage = '정말로 삭제하시겠습니까?';
        if (hasChildren) {
            confirmMessage = '이 메뉴에는 하위 메뉴가 있습니다. 하위 메뉴도 함께 삭제됩니다. 계속하시겠습니까?';
        }

        if (!confirm(confirmMessage)) return;

        try {
            const response = await fetch(`/api/navigation-menus/${menuId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await loadMenus(); // 메뉴 다시 로드
                alert('메뉴가 삭제되었습니다.');
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };



    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMenu(null);
    };

    // 토글 확장/축소
    const toggleExpand = (menuId) => {
        const newExpanded = new Set(expandedItems);
        if (newExpanded.has(menuId)) {
            newExpanded.delete(menuId);
        } else {
            newExpanded.add(menuId);
        }
        setExpandedItems(newExpanded);
    };

    // 하위 메뉴 추가
    const addSubMenu = (parentMenu) => {
        const nextOrder = parentMenu.children ? Math.max(...parentMenu.children.map(c => c.menu_order), 0) + 1 : 1;
        openModal(null, parentMenu.navigationMenuId, parentMenu.menu_level + 1, nextOrder);
    };

    // 모달 열기 (수정된 버전)
    const openModal = (menu = null, parentId = null, level = 1, order = 1) => {
        setEditingMenu(menu);
        if (menu) {
            setFormData({
                name: menu.name || '',
                description: menu.description || '',
                url: menu.url || '',
                icon: menu.icon || '',
                parent_id: menu.parent_id,
                menu_level: menu.menu_level || 1,
                menu_order: menu.menu_order || 1,
                required_role: menu.required_role || 1,
                is_active: menu.is_active !== undefined ? menu.is_active : true,
                has_children: menu.has_children || false
            });
        } else {
            // 새 메뉴 추가 시
            const nextOrder = parentId
                ? order
                : Math.max(...menus.filter(m => m.parent_id === null).map(m => m.menu_order), 0) + 1;

            setFormData({
                name: '',
                description: '',
                url: '',
                icon: '',
                parent_id: parentId,
                menu_level: level,
                menu_order: nextOrder,
                required_role: 1,
                is_active: true,
                has_children: false
            });
        }
        setIsModalOpen(true);
    };

    // 메뉴 아이템 렌더링
    const renderMenuItem = (menu, level = 0) => {
        const hasChildren = menu.children && menu.children.length > 0;
        const isExpanded = expandedItems.has(menu.navigationMenuId);

        return (
            <div key={menu.navigationMenuId} className="mb-1">
                <div
                    className={`flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 ${
                        level > 0 ? 'ml-6 border-l-4 border-l-blue-200' : ''
                    }`}
                >
                    <div className="flex items-center space-x-3">
                        {hasChildren && (
                            <button
                                onClick={() => toggleExpand(menu.navigationMenuId)}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                {isExpanded ?
                                    <ChevronDown size={16} /> :
                                    <ChevronRight size={16} />
                                }
                            </button>
                        )}
                        {!hasChildren && <div className="w-6"></div>}

                        <div className="flex items-center space-x-2">
                            {menu.icon && (
                                <span className="text-gray-500 text-sm">{menu.icon}</span>
                            )}
                            <span className="font-medium">{menu.name}</span>
                            {!menu.is_active && (
                                <EyeOff size={16} className="text-gray-400" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              레벨: {menu.menu_level} | 순서: {menu.menu_order}
            </span>

                        {/*/!* 하위 메뉴 추가 버튼 *!/*/}
                        {/*<button*/}
                        {/*    onClick={() => addSubMenu(menu)}*/}
                        {/*    className="p-2 text-green-600 hover:bg-green-50 rounded"*/}
                        {/*    title="하위 메뉴 추가"*/}
                        {/*>*/}
                        {/*    <Plus size={16} />*/}
                        {/*</button>*/}

                        <button
                            onClick={() => openModal(menu)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="수정"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={() => handleDeleteMenu(menu.navigationMenuId)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="삭제"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>

                {hasChildren && isExpanded && (
                    <div className="mt-2">
                        {menu.children.map(child => renderMenuItem(child, level + 1))}
                        {/* 하위 메뉴 추가 영역 */}
                        <div className={`ml-6 mt-2`}>
                            <button
                                onClick={() => addSubMenu(menu)}
                                className="flex items-center space-x-2 p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-300 w-full"
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

    // 상위 메뉴 옵션 생성
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">메뉴 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const menuTree = buildMenuTree(menus);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* 헤더 */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">네비게이션 메뉴 관리</h1>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => openModal()}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={20} />
                            <span>최상위 메뉴 추가</span>
                        </button>
                    </div>
                </div>

                {/* 메뉴 목록 */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    {menuTree.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-4">등록된 메뉴가 없습니다.</div>
                            <button
                                onClick={() => openModal()}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mx-auto"
                            >
                                <Plus size={16} />
                                <span>첫 번째 메뉴 추가하기</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {menuTree.map(menu => renderMenuItem(menu))}
                            {/* 최상위 메뉴 추가 영역 */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => openModal()}
                                    className="flex items-center space-x-2 p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-300 w-full"
                                >
                                    <Plus size={16} />
                                    <span>최상위 메뉴 추가</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 모달 */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h2 className="text-xl font-bold mb-4">
                                {editingMenu ? '메뉴 수정' : '메뉴 추가'}
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        메뉴명 *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="메뉴명을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        설명
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="메뉴 설명을 입력하세요"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.url}
                                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="/path/to/page"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        아이콘
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="아이콘명"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        상위 메뉴
                                    </label>
                                    <select
                                        value={formData.parent_id || ''}
                                        onChange={(e) => {
                                            const parentId = e.target.value === '' ? null : parseInt(e.target.value);
                                            const parentMenu = menus.find(m => m.navigationMenuId === parentId);
                                            setFormData({
                                                ...formData,
                                                parent_id: parentId,
                                                menu_level: parentId ? (parentMenu?.menu_level || 1) + 1 : 1
                                            });
                                        }}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {getParentOptions().map(option => (
                                            <option key={option.value || 'null'} value={option.value || ''}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            메뉴 순서
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.menu_order}
                                            onChange={(e) => setFormData({...formData, menu_order: parseInt(e.target.value) || 1})}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="1"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            필요 권한
                                        </label>
                                        <select
                                            value={formData.required_role}
                                            onChange={(e) => setFormData({...formData, required_role: parseInt(e.target.value)})}
                                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value={1}>일반사용자</option>
                                            <option value={2}>관리자</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="mr-2"
                                        />
                                        활성화
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.has_children}
                                            onChange={(e) => setFormData({...formData, has_children: e.target.checked})}
                                            className="mr-2"
                                        />
                                        하위 메뉴 있음
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    onClick={closeModal}
                                    className="flex items-center space-x-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                                >
                                    <X size={16} />
                                    <span>취소</span>
                                </button>
                                <button
                                    onClick={handleSaveMenu}
                                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
    );
};

export default MenuManagement;