import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../styles/management/AuthManagement.css';

const AuthManagement = () => {
    const [userList, setUserList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredUserList, setFilteredUserList] = useState([]);
    const [filterRole, setFilterRole] = useState('all');
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetchUserList();
    }, []);

    const filterUsers = () => {
        let filtered = userList;

        // 검색어 필터링
        if (searchTerm.trim()) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 권한 필터링
        if (filterRole !== 'all') {
            filtered = filtered.filter(user => {
                if (filterRole === 'admin') return user.isAdmin;
                if (filterRole === 'user') return !user.isAdmin;
                return true;
            });
        }

        setFilteredUserList(filtered);
    };

    const fetchUserList = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/users`, { withCredentials: true });
            if (response.data.success) {
                setUserList(response.data.users);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '오류',
                    text: '회원 목록을 불러오지 못했습니다.',
                    confirmButtonColor: '#3085d6'
                });
            }
        } catch (err) {
            console.error('회원 목록 조회 오류:', err);
            Swal.fire({
                icon: 'error',
                title: '네트워크 오류',
                text: '서버와의 연결에 문제가 발생했습니다.',
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleAdmin = async (userId, userName, isAdmin) => {
        // 관리자 권한 변경 확인 모달
        const result = await Swal.fire({
            title: '권한 변경 확인',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p><strong>사용자:</strong> ${userName}</p>
                    <p><strong>현재 권한:</strong> ${isAdmin ? '관리자' : '일반회원'}</p>
                    <p><strong>변경될 권한:</strong> ${!isAdmin ? '관리자' : '일반회원'}</p>
                </div>
                <p style="color: #e74c3c; font-weight: bold;">
                    ${!isAdmin ? '관리자 권한을 부여하시겠습니까?' : '관리자 권한을 해제하시겠습니까?'}
                </p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: !isAdmin ? '#28a745' : '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: !isAdmin ? '권한 부여' : '권한 해제',
            cancelButtonText: '취소',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.post(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
                    isAdmin: !isAdmin
                }, { withCredentials: true });

                if (response.data.success) {
                    await Swal.fire({
                        icon: 'success',
                        title: '권한 변경 완료',
                        text: `${userName}님의 권한이 성공적으로 변경되었습니다.`,
                        confirmButtonColor: '#3085d6',
                        timer: 2000,
                        timerProgressBar: true
                    });
                    fetchUserList(); // 변경 후 목록 다시 불러오기
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: '권한 변경 실패',
                        text: '권한 변경에 실패했습니다.',
                        confirmButtonColor: '#3085d6'
                    });
                }
            } catch (err) {
                console.error('권한 변경 오류:', err);
                Swal.fire({
                    icon: 'error',
                    title: '오류 발생',
                    text: '권한 변경 중 오류가 발생했습니다.',
                    confirmButtonColor: '#3085d6'
                });
            }
        }
    };

    const showUserDetails = (user) => {
        Swal.fire({
            title: '사용자 상세 정보',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <strong>아이디:</strong> ${user.username}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>이름:</strong> ${user.name}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>이메일:</strong> ${user.email}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>권한:</strong> 
                        <span style="color: ${user.isAdmin ? '#28a745' : '#6c757d'}; font-weight: bold;">
                            ${user.isAdmin ? '관리자' : '일반회원'}
                        </span>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>가입일:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '정보 없음'}
                    </div>
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: '확인'
        });
    };

    return (
        <Layout>
            <div className="user-management-container">
                <div className="header-section">
                    <h2>회원 관리</h2>
                    <button
                        className="refresh-button"
                        onClick={fetchUserList}
                        disabled={loading}
                    >
                        {loading ? '새로고침 중...' : '새로고침'}
                    </button>
                </div>

                <div className="user-stats">
                    <div className="stat-item">
                        <span className="stat-label">전체 회원:</span>
                        <span className="stat-value">{userList.length}명</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">관리자:</span>
                        <span className="stat-value admin">{userList.filter(user => user.isAdmin).length}명</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">일반회원:</span>
                        <span className="stat-value">{userList.filter(user => !user.isAdmin).length}명</span>
                    </div>
                </div>

                <div className="search-container">
                    <div className="search-inputs">
                        <div className="search-input-group">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="이름, 이메일, 아이디로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                className="clear-search"
                                onClick={() => setSearchTerm('')}
                                style={{ display: searchTerm ? 'block' : 'none' }}
                            >
                                ✕
                            </button>
                        </div>
                        <select
                            className="role-filter"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">모든 권한</option>
                            <option value="admin">관리자만</option>
                            <option value="user">일반회원만</option>
                        </select>
                    </div>
                    <div className="search-results">
                        검색 결과: <strong>{filteredUserList.length}명</strong>
                        {(searchTerm || filterRole !== 'all') && (
                            <button
                                className="reset-filters"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterRole('all');
                                }}
                            >
                                필터 초기화
                            </button>
                        )}
                    </div>
                </div>

                <div className="table-container">
                    <table className="user-table">
                        <thead>
                        <tr>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>권한</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {userList.map(user => (
                            <tr key={user.id} className={user.isAdmin ? 'admin-row' : ''}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                        <span className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                                            {user.isAdmin ? '관리자' : '일반회원'}
                                        </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="detail-button"
                                            onClick={() => showUserDetails(user)}
                                            title="상세 정보"
                                        >
                                            상세
                                        </button>
                                        <button
                                            className={`role-toggle-button ${user.isAdmin ? 'revoke' : 'grant'}`}
                                            disabled={user.isAdmin && user.username === 'admin'}
                                            onClick={() => toggleAdmin(user.id, user.name, user.isAdmin)}
                                            title={user.isAdmin && user.username === 'admin' ? '메인 관리자는 권한을 변경할 수 없습니다' : ''}
                                        >
                                            {user.isAdmin ? '권한 해제' : '관리자 부여'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {userList.length === 0 && !loading && (
                            <tr>
                                <td colSpan="4" className="no-data">
                                    회원이 없습니다.
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="4" className="loading">
                                    데이터를 불러오는 중...
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>


        </Layout>
    );
};

export default AuthManagement;