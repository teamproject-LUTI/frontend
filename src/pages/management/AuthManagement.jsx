// AuthManagement.jsx - 백엔드 구조에 맞게 최종 수정

import React, {useEffect, useState} from 'react';
import Layout from '../../components/layout/Layout';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../../styles/management/AuthManagement.css';

const AuthManagement = () => {
    const [userList, setUserList] = useState([]);
    const [filteredUserList, setFilteredUserList] = useState([]);
    const [statistics, setStatistics] = useState({
        totalUsers: 0,
        adminCount: 0,
        userCount: 0,
        activeUserCount: 0,
        socialLoginCount: 0
    });
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 20
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

// AuthManagement.jsx에 추가할 부분

// 1. 현재 로그인한 사용자 정보를 저장할 state 추가
    const [currentUser, setCurrentUser] = useState(null);

    // UserType 상수 (백엔드 UserTypeEnum과 일치)
    const USER_TYPE = {
        USER: 1,
        ADMIN: 2
    };

    // Axios 인스턴스 생성
    const api = axios.create({
        baseURL: process.env.NODE_ENV === 'development'
            ? process.env.REACT_APP_API_URL || 'http://localhost:8080'
            : '',
        withCredentials: true,
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    // 요청 인터셉터
    api.interceptors.request.use(
        config => {
            const separator = config.url.includes('?') ? '&' : '?';
            config.url += `${separator}_t=${new Date().getTime()}`;
            return config;
        },
        error => Promise.reject(error)
    );

    // 응답 인터셉터 - 공통 에러 처리
    api.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                Swal.fire({
                    icon: 'warning',
                    title: '인증 필요',
                    text: '인증이 필요합니다. 다시 로그인해주세요.',
                    confirmButtonText: '로그인 페이지로',
                    allowOutsideClick: false
                }).then(() => {
                    window.location.href = '/login';
                });
                return Promise.reject(new Error('인증이 필요합니다.'));
            }

            if (error.response?.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: '권한 부족',
                    text: '관리자 권한이 필요합니다.',
                    confirmButtonColor: '#3085d6'
                });
                return Promise.reject(new Error('관리자 권한이 필요합니다.'));
            }

            if (error.code === 'NETWORK_ERROR' || !error.response) {
                const networkError = new Error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
                networkError.isNetworkError = true;
                return Promise.reject(networkError);
            }

            const httpError = new Error(
                error.response?.data?.error ||
                error.response?.data?.message ||
                `HTTP ${error.response?.status} 오류가 발생했습니다.`
            );
            httpError.status = error.response?.status;
            httpError.data = error.response?.data;

            return Promise.reject(httpError);
        }
    );

    useEffect(() => {
        fetchUserList();
        fetchCurrentUser()
    }, []);

    useEffect(() => {
        filterUsers();
    }, [userList, searchTerm, filterRole]);

    const filterUsers = () => {
        let filtered = userList;

        // 검색어 필터링
        if (searchTerm.trim()) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 권한 필터링 - isAdmin 필드로 필터링 (백엔드에서 계산된 값)
        if (filterRole !== 'all') {
            filtered = filtered.filter(user => {
                if (filterRole === 'admin') return user.isAdmin === true;
                if (filterRole === 'user') return user.isAdmin === false;
                return true;
            });
        }

        setFilteredUserList(filtered);
    };

    //현재 사용자 정보
    const fetchCurrentUser = async () => {
        try {
            const response = await api.get('/api/auth/me');
            if (response.data.success) {
                setCurrentUser(response.data.user);
            }
        } catch (error) {
            console.error('현재 사용자 정보 조회 실패:', error);
        }
    };

    // 사용자 목록 조회
    const fetchUserList = async (page = 0, size = 20) => {
        try {
            setLoading(true);

            const response = await api.get('/api/admin/users', {
                params: {
                    page,
                    size,
                    sortBy: 'createdAt',
                    sortDir: 'desc'
                }
            });

            if (response.data.success) {
                setUserList(response.data.users || []);
                setFilteredUserList(response.data.users || []);

                // 페이징 정보 설정
                setPagination({
                    currentPage: response.data.currentPage || 0,
                    totalPages: response.data.totalPages || 0,
                    totalElements: response.data.totalElements || 0,
                    pageSize: response.data.pageSize || 20
                });

                // 통계 정보 설정
                if (response.data.statistics) {
                    setStatistics(response.data.statistics);
                }
            } else {
                throw new Error(response.data.error || '사용자 목록을 불러오지 못했습니다.');
            }

        } catch (error) {
            console.error('=== 회원 목록 조회 오류 ===');
            console.error('오류:', error);

            if (error.message.includes('인증이 필요합니다') || error.message.includes('관리자 권한')) {
                return;
            }

            let errorMessage = '회원 목록을 불러오지 못했습니다.';
            if (error.isNetworkError) {
                errorMessage = '서버와의 연결에 문제가 발생했습니다.';
            } else if (error.status) {
                errorMessage = `서버 오류: HTTP ${error.status}`;
            }

            Swal.fire({
                icon: 'error',
                title: '네트워크 오류',
                text: errorMessage,
                confirmButtonColor: '#3085d6'
            });
        } finally {
            setLoading(false);
        }
    };

    // 권한 변경 함수
    const toggleAdmin = async (userId, userName, isAdmin) => {

        // 자기 자신의 관리자 권한 해제 시도 체크
        if (currentUser && currentUser.userId === userId && isAdmin) {
            // 현재 관리자인 자기 자신의 권한을 해제하려는 경우
            Swal.fire({
                icon: 'warning',
                title: '권한 변경 불가',
                text: '자기 자신의 관리자 권한을 해제할 수 없습니다.',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

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


        try {
            const requestData = {
                isAdmin: !isAdmin
            };

            const response = await api.post(`/api/admin/users/${userId}/role`, requestData);

            if (response.data.success) {

                await Swal.fire({
                    icon: 'success',
                    title: '권한 변경 완료',
                    text: `${userName}님의 권한이 성공적으로 변경되었습니다.`,
                    confirmButtonColor: '#3085d6',
                    timer: 2000,
                    timerProgressBar: true
                });

                await fetchUserList();

            } else {
                throw new Error(response.data.error || '권한 변경에 실패했습니다.');
            }

        } catch (error) {

            if (error.response) {
                console.error('응답 상태:', error.response.status);
                console.error('응답 데이터:', error.response.data);
            }

            // 인터셉터에서 이미 처리된 에러는 return
            if (error.message.includes('인증이 필요합니다') || error.message.includes('관리자 권한')) {
                return;
            }

            // 백엔드에서 오는 구체적인 에러 메시지 처리
            let errorMessage = '권한 변경 중 오류가 발생했습니다.';
            let errorTitle = '오류 발생';
            let errorIcon = 'error';

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;

                // 자기 자신 권한 해제 시도인 경우 특별 처리
                if (errorMessage.includes('자기 자신의 관리자 권한을 해제할 수 없습니다')) {
                    errorTitle = '권한 변경 불가';
                    errorIcon = 'warning';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                icon: errorIcon,
                title: errorTitle,
                text: errorMessage,
                confirmButtonColor: '#3085d6'
            });
        }
    };

    // 사용자 상세 정보 표시
    const showUserDetails = (user) => {
        Swal.fire({
            title: '사용자 상세 정보',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <strong>사용자 ID:</strong> ${user.userId || '-'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>이름:</strong> ${user.name || '-'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>닉네임:</strong> ${user.nickname || '-'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>이메일:</strong> ${user.email || '-'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>권한:</strong> 
                        <span style="color: ${user.isAdmin ? '#28a745' : '#6c757d'}; font-weight: bold;">
                            ${user.isAdmin ? '관리자' : '일반회원'}
                        </span>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>사용자 타입:</strong> ${user.userType || '-'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>사용자 타입 ID:</strong> ${user.userTypeId || '-'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>활성 상태:</strong> 
                        <span style="color: ${user.isActive ? '#28a745' : '#dc3545'};">
                            ${user.isActive ? '활성' : '비활성'}
                        </span>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>이메일 인증:</strong> 
                        <span style="color: ${user.isEmailVerified ? '#28a745' : '#dc3545'};">
                            ${user.isEmailVerified ? '인증됨' : '미인증'}
                        </span>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>가입일:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '정보 없음'}
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong>최근 수정일:</strong> ${user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('ko-KR') : '정보 없음'}
                    </div>
                    ${user.lastLoginAt ? `
                        <div style="margin-bottom: 15px;">
                            <strong>최근 로그인:</strong> ${new Date(user.lastLoginAt).toLocaleDateString('ko-KR')}
                        </div>
                    ` : ''}
                    ${user.provider ? `
                        <div style="margin-bottom: 15px;">
                            <strong>로그인 제공자:</strong> ${user.provider}
                        </div>
                    ` : ''}
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#3085d6',
            confirmButtonText: '확인',
            width: '500px'
        });
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchUserList(newPage, pagination.pageSize);
        }
    };

    // 검색 기능
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchUserList();
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/api/admin/users/search', {
                params: {
                    keyword: searchTerm.trim(),
                    page: 0,
                    size: pagination.pageSize
                }
            });

            if (response.data.success) {
                setUserList(response.data.users || []);
                setPagination({
                    currentPage: response.data.currentPage || 0,
                    totalPages: response.data.totalPages || 0,
                    totalElements: response.data.totalElements || 0,
                    pageSize: response.data.pageSize || 20
                });
            }
        } catch (error) {
            console.error('검색 오류:', error);
            if (!error.message.includes('인증이 필요합니다') && !error.message.includes('관리자 권한')) {
                Swal.fire({
                    icon: 'error',
                    title: '검색 오류',
                    text: '검색 중 오류가 발생했습니다.',
                    confirmButtonColor: '#3085d6'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="user-management-container">
                <div className="header-section">
                    <h2>회원 관리</h2>
                    <button
                        className="refresh-button"
                        onClick={() => fetchUserList()}
                        disabled={loading}
                    >
                        {loading ? '새로고침 중...' : '새로고침'}
                    </button>
                </div>

                {/* 통계 정보 */}
                <div className="user-stats">
                    <div className="stat-item">
                        <span className="stat-label">전체 회원:</span>
                        <span className="stat-value">{statistics.totalUsers}명</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">관리자:</span>
                        <span className="stat-value admin">{statistics.adminCount}명</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">일반회원:</span>
                        <span className="stat-value">{statistics.userCount}명</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">활성 사용자:</span>
                        <span className="stat-value">{statistics.activeUserCount}명</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">소셜 로그인:</span>
                        <span className="stat-value">{statistics.socialLoginCount}명</span>
                    </div>
                </div>

                <div className="auth-search-container">
                    <div className="auth-search-inputs">
                        <div className="auth-search-input-group">
                            <input
                                type="text"
                                className="auth-search-input"
                                placeholder="이름, 이메일, 닉네임으로 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                className="auth-search-button"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                검색
                            </button>
                            <button
                                className="auth-clear-search"
                                onClick={() => {
                                    setSearchTerm('');
                                    fetchUserList();
                                }}
                                style={{display: searchTerm ? 'block' : 'none'}}
                            >
                                ✕
                            </button>
                        </div>
                        <select
                            className="auth-role-filter"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                        >
                            <option value="all">모든 권한</option>
                            <option value="admin">관리자만</option>
                            <option value="user">일반회원만</option>
                        </select>
                    </div>
                    <div className="auth-search-results">
                        검색 결과: <strong>{filteredUserList.length}명</strong>
                        {(searchTerm || filterRole !== 'all') && (
                            <button
                                className="auth-reset-filters"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterRole('all');
                                    fetchUserList();
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
                            <th>ID</th>
                            <th>이름/닉네임</th>
                            <th>이메일</th>
                            <th>권한</th>
                            <th>상태</th>
                            <th>가입일</th>
                            <th>관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUserList.map(user => (
                            <tr key={user.userId} className={user.isAdmin ? 'admin-row' : ''}>
                                <td>{user.userId}</td>
                                <td>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <span style={{fontWeight: '500'}}>{user.name}</span>
                                        {user.nickname && (
                                            <span style={{fontSize: '12px', color: '#666'}}>@{user.nickname}</span>
                                        )}
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`auth-role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                                        {user.isAdmin ? '관리자' : '일반회원'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                            {user.isActive ? '활성' : '비활성'}
                                        </span>
                                        {user.provider && user.provider !== 'LOCAL' && (
                                            <span style={{fontSize: '11px', color: '#666'}}>
                                                {user.provider}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                        <span style={{fontSize: '13px'}}>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ko-KR') : '-'}
                                        </span>
                                        {user.lastLoginAt && (
                                            <span style={{fontSize: '11px', color: '#666'}}>
                                                최근: {new Date(user.lastLoginAt).toLocaleDateString('ko-KR')}
                                            </span>
                                        )}
                                    </div>
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
                                            className={`auth-role-toggle-button ${user.isAdmin ? 'revoke' : 'grant'}`}
                                            disabled={!user.canModify}
                                            onClick={() => toggleAdmin(user.userId, user.name, user.isAdmin)}
                                            title={!user.canModify ? '수정할 수 없는 사용자입니다' : ''}
                                        >
                                            {user.isAdmin ? '권한 해제' : '관리자 부여'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUserList.length === 0 && !loading && (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    {searchTerm || filterRole !== 'all' ? '검색 조건에 맞는 회원이 없습니다.' : '회원이 없습니다.'}
                                </td>
                            </tr>
                        )}
                        {loading && (
                            <tr>
                                <td colSpan="7" className="loading">
                                    데이터를 불러오는 중...
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* 페이징 */}
                {pagination.totalPages > 1 && (
                    <div className="pagination-container">
                        <div className="pagination-info">
                            {pagination.totalElements}명
                            중 {(pagination.currentPage * pagination.pageSize) + 1}-{Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)}명
                            표시
                        </div>
                        <div className="pagination">
                            <button
                                disabled={pagination.currentPage === 0}
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                            >
                                이전
                            </button>
                            {/* 페이지 번호 버튼들 */}
                            {Array.from({length: pagination.totalPages}, (_, i) => (
                                <button
                                    key={i + 1}
                                    className={pagination.currentPage === i ? 'active' : ''}
                                    onClick={() => handlePageChange(i)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                disabled={pagination.currentPage >= pagination.totalPages - 1}
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                            >
                                다음
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AuthManagement;