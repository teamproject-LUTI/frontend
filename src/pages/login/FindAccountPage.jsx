import React, { useState } from 'react';
import '../../styles/login/FindAccount.css';
import Layout from '../../components/layout/Layout';
import Swal from 'sweetalert2';

const FindAccountPage = () => {
    const [activeTab, setActiveTab] = useState('findId'); // 'findId' 또는 'findPassword'

    const [idForm, setIdForm] = useState({ name: '', phoneNumber: '' });
    const [pwForm, setPwForm] = useState({ email: '', name: '' });

    const handleIdSubmit = (e) => {
        e.preventDefault();

        const { name, phoneNumber } = idForm;

        // '-' 문자 체크
        if (phoneNumber.includes('-')) {
            Swal.fire({icon: 'warning', text: "휴대폰 번호에서 '-'를 제외하고 입력해주세요."});
            return;
        }

        // 자리수 체크
        if (!/^\d{11}$/.test(phoneNumber)) {
            Swal.fire({icon: 'warning', text: "휴대폰 번호는 숫자 11자리여야 합니다."});
            return;
        }

        console.log('아이디 찾기 요청:', idForm);
    };

    const handlePwSubmit = (e) => {
        e.preventDefault();
        console.log('비밀번호 찾기 요청:', pwForm);
    };

    return (
        <Layout>
            <div className="find-account-container">
                <div className="find-account-box">
                    <div className="tab-header">
                        <div
                            className={`tab ${activeTab === 'findId' ? 'active' : ''}`}
                            onClick={() => setActiveTab('findId')}
                        >
                            아이디 찾기
                        </div>
                        <div
                            className={`tab ${activeTab === 'findPassword' ? 'active' : ''}`}
                            onClick={() => setActiveTab('findPassword')}
                        >
                            비밀번호 찾기
                        </div>
                    </div>

                    {activeTab === 'findId' && (
                        <form onSubmit={handleIdSubmit} className="find-account-form">
                            <input
                                type="text"
                                placeholder="이름"
                                value={idForm.name}
                                onChange={(e) => setIdForm({ ...idForm, name: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="휴대폰 번호('-'제외)"
                                value={idForm.phoneNumber}
                                onChange={(e) => setIdForm({ ...idForm, phoneNumber: e.target.value })}
                                required
                            />
                            <button type="submit" className="submit-btn">확인</button>
                        </form>
                    )}

                    {activeTab === 'findPassword' && (
                        <form onSubmit={handlePwSubmit} className="find-account-form">
                            <input
                                type="email"
                                placeholder="이메일"
                                value={pwForm.email}
                                onChange={(e) => setPwForm({ ...pwForm, email: e.target.value })}
                                required
                            />
                            <input
                                type="text"
                                placeholder="이름"
                                value={pwForm.name}
                                onChange={(e) => setPwForm({ ...pwForm, name: e.target.value })}
                                required
                            />
                            <button type="submit" className="submit-btn">확인</button>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default FindAccountPage;
