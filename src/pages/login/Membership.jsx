import React, { useState, useEffect } from 'react';
import '../../styles/login/Membership.css';
import Layout from '../../components/layout/Layout';

const Membership = () => {
    const [formData, setFormData] = useState({
        user_id:'',
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        birthYear: '',
        birthMonth: '',
        birthDay: '',
        phonePrefix: '010',
        phoneNumber: '',
        gender: '',
        nickname: '',
        address: ''
    });

    const [birthDays, setBirthDays] = useState([]);

    // 년도 배열 생성 (1950년부터 현재까지)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i);

    // 월 배열 생성
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    // 일 배열 업데이트
    useEffect(() => {
        if (formData.birthYear && formData.birthMonth) {
            const daysInMonth = new Date(
                parseInt(formData.birthYear),
                parseInt(formData.birthMonth),
                0
            ).getDate();
            setBirthDays(Array.from({ length: daysInMonth }, (_, i) => i + 1));
        } else {
            setBirthDays(Array.from({ length: 31 }, (_, i) => i + 1));
        }
    }, [formData.birthYear, formData.birthMonth]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 모든 필수 필드 검증
        const requiredFields = ['email', 'password', 'name', 'birthYear', 'birthMonth', 'birthDay', 'phoneNumber', 'gender', 'nickname', 'address'];
        const emptyFields = requiredFields.filter(field => !formData[field]);

        if (emptyFields.length > 0) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }

        console.log('회원가입 데이터:', formData);
        alert('회원가입이 완료되었습니다!');
    };


    return (
        <Layout>
        <div className="membershipContainer">
            <div className="membershipFormWrapper">
                <div className="membershipHeader">
                    <h2 className="tagline">회원가입</h2>
                </div>

                <div className= "membershipForm">
                    {/* 아이디*/}
                    <div className="formGroup">
                        <label className="formLabel">아이디</label>
                        <input
                            type="text"
                            name="user_id"
                            value={formData.user_id}
                            onChange={handleInputChange}
                            className="formInput"
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>
                    {/* 이메일 */}
                    <div className="formGroup">
                        <label className="formLabel">이메일</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="formInput"
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>

                    {/* 비밀번호 */}
                    <div className="formGroup">
                        <label className="formLabel">비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="formInput"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="formGroup">
                        <label className="formLabel">비밀번호 확인</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="formInput"
                            placeholder="비밀번호를 다시 입력하세요"
                            required
                        />
                    </div>

                    {/* 이름 */}
                    <div className="formGroup">
                        <label className="formLabel">이름</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="formInput"
                            placeholder="이름을 입력하세요"
                            required
                        />
                    </div>

                    {/* 생년월일 */}
                    <div className="formGroup">
                        <label className="formLabel">생년월일</label>
                        <div className="birthGroup">
                            <select
                                name="birthYear"
                                value={formData.birthYear}
                                onChange={handleInputChange}
                                className="birthSelect"
                                required
                            >
                                <option value="">년도</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}년</option>
                                ))}
                            </select>
                            <select
                                name="birthMonth"
                                value={formData.birthMonth}
                                onChange={handleInputChange}
                                className="birthSelect"
                                required
                            >
                                <option value="">월</option>
                                {months.map(month => (
                                    <option key={month} value={month.toString().padStart(2, '0')}>
                                        {month}월
                                    </option>
                                ))}
                            </select>
                            <select
                                name="birthDay"
                                value={formData.birthDay}
                                onChange={handleInputChange}
                                className="birthSelect"
                                required
                            >
                                <option value="">일</option>
                                {birthDays.map(day => (
                                    <option key={day} value={day.toString().padStart(2, '0')}>
                                        {day}일
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 전화번호 */}
                    <div className="formGroup">
                        <label className="formLabel">전화번호</label>
                        <div className="phoneGroup">
                            <select
                                name="phonePrefix"
                                value={formData.phonePrefix}
                                onChange={handleInputChange}
                                className="phoneSelect"
                                required
                            >
                                <option value="010">010</option>
                            </select>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="phoneInput"
                                placeholder="전화번호를 입력하세요"
                                pattern="[0-9]{8}"
                                required
                            />
                        </div>
                    </div>

                    {/* 성별 */}
                    <div className="formGroup">
                        <label className="formLabel">성별</label>
                        <div className="radioGroup">
                            <div className="radioItem">
                                <input
                                    type="radio"
                                    id="male"
                                    name="gender"
                                    value="male"
                                    checked={formData.gender === 'male'}
                                    onChange={handleInputChange}
                                    className= "radioInput"
                                    required
                                />
                                <label htmlFor="male" className="radioLabel">남성</label>
                            </div>
                            <div className="radioItem">
                                <input
                                    type="radio"
                                    id="female"
                                    name="gender"
                                    value="female"
                                    checked={formData.gender === 'female'}
                                    onChange={handleInputChange}
                                    className="radioInput"
                                    required
                                />
                                <label htmlFor="female" className="radioLabel">여성</label>
                            </div>
                        </div>
                    </div>

                    {/* 별명 */}
                    <div className="formGroup">
                        <label className="formLabel">별명</label>
                        <input
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleInputChange}
                            className="formInput"
                            placeholder="별명을 입력하세요"
                            required
                        />
                    </div>

                    {/* 주소 */}
                    <div className="formGroup">
                        <label className="formLabel">주소</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="formInput"
                            placeholder="주소를 입력하세요"
                            required
                        />
                    </div>

                    {/* 가입 버튼 */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="btn"
                    >
                        회원가입
                    </button>
                </div>

                <div className="login-link" >
                    <a
                        href="/"
                        className="loginLinkAnchor"
                    >
                        이미 계정이 있으시나요? 로그인
                    </a>
                </div>
            </div>
        </div>
        </Layout>
    );
};

export default Membership;