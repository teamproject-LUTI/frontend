import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import axios from 'axios';
//import '../../styles/Admin/UserManagement.css';

const UserManagement = () => {
    console.log('UserManagement 컴포넌트 렌더링됨!');
    const [userList, setUserList] = useState([]);
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetchUserList();
    }, []);

    const fetchUserList = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin/users`, { withCredentials: true });
            if (response.data.success) {
                setUserList(response.data.users);
            } else {
                alert('회원 목록을 불러오지 못했습니다.');
            }
        } catch (err) {
            console.error('회원 목록 조회 오류:', err);
        }
    };

    const toggleAdmin = async (userId, isAdmin) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
                isAdmin: !isAdmin
            }, { withCredentials: true });

            if (response.data.success) {
                fetchUserList(); // 변경 후 목록 다시 불러오기
            } else {
                alert('권한 변경에 실패했습니다.');
            }
        } catch (err) {
            console.error('권한 변경 오류:', err);
        }
    };

    return (
        <Layout>
            <div className="user-management-container">
                <h2>회원 관리</h2>
                <table className="user-table">
                    <thead>
                    <tr>
                        <th>아이디</th>
                        <th>이름</th>
                        <th>이메일</th>
                        <th>권한</th>
                        <th>관리</th>
                    </tr>
                    </thead>
                    <tbody>
                    {userList.map(user => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.isAdmin ? '관리자' : '일반회원'}</td>
                            <td>
                                <button
                                    className="role-toggle-button"
                                    disabled={user.isAdmin && user.username === 'admin'}
                                    onClick={() => toggleAdmin(user.id, user.isAdmin)}
                                >
                                    {user.isAdmin ? '관리자 해제' : '관리자 부여'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {userList.length === 0 && (
                        <tr>
                            <td colSpan="5">회원이 없습니다.</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default UserManagement;