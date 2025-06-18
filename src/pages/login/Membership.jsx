import React, {useState, useEffect} from 'react';
import '../../styles/login/Membership.css';
import Layout from '../../components/layout/Layout';
import Swal from 'sweetalert2';
import EmailVerification from '../../components/login/EmailVerification';

const Membership = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        birthYear: '',
        birthMonth: '',
        birthDay: '',
        phonePrefix: '010',
        phoneNumber1: '',
        phoneNumber2: '',
        gender: '',
        nickname: ''
    });

    const [birthDays, setBirthDays] = useState([]);
    const [resultMessage, setResultMessage] = useState('');
    const [isVerified, setIsVerified] = useState(false); // 인증 완료 상태
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState(''); // 모달 내부 에러 메시지 상태
    const [verificationError, setVerificationError] = useState('');

    // 년도 배열 생성 (1950년부터 현재까지)
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: currentYear - 1949}, (_, i) => currentYear - i);

    // 월 배열 생성
    const months = Array.from({length: 12}, (_, i) => i + 1);

    // 일 배열 업데이트
    useEffect(() => {
        if (formData.birthYear && formData.birthMonth) {
            const daysInMonth = new Date(
                parseInt(formData.birthYear),
                parseInt(formData.birthMonth),
                0
            ).getDate();
            setBirthDays(Array.from({length: daysInMonth}, (_, i) => i + 1));
        } else {
            setBirthDays(Array.from({length: 31}, (_, i) => i + 1));
        }
    }, [formData.birthYear, formData.birthMonth]);

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get("token");
        if (token) {
            fetch(`http://localhost:8080/api/auth/verify?token=${token}`, {
                credentials: 'include' // 세션 공유 위해 필요
            })
                .then(res => res.text())
                .then(result => {
                    setResultMessage(result);
                    if (result.includes("완료")) {
                        setIsVerified(true);
                    }
                })
                .catch(() => setResultMessage("인증 실패"));
        }
    }, []);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEmailVerification = () => {
        if (!formData.email) {
            Swal.fire({icon: 'warning', text: '이메일을 입력해주세요.'});
            return;
        }

        if (!isValidEmailFormat(formData.email)) {
            Swal.fire({ icon: 'warning', text: '이메일 형식이 올바르지 않습니다.' });
            return;
        }

        fetch("http://localhost:8080/api/signup/email", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: 'include',
            body: JSON.stringify({ email: formData.email })
        })
            .then(async res => {
                const msg = await res.text();

                if (res.ok) {
                    Swal.fire({ icon: 'info', text: msg });
                    setShowVerification(true);
                } else {
                    Swal.fire({ icon: 'error', text: msg });
                }
            })
            .catch(() => Swal.fire({ icon: 'error', text: '이메일 전송 실패' }));
    };

    const isValidEmailFormat = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleCodeChange = (e) => setVerificationCode(e.target.value);

    const handleCodeVerify = () => {
        fetch(`http://localhost:8080/api/signup/verify-code?code=${verificationCode}`, {
            method: "GET",
            credentials: 'include',
        })
            .then(async res => {
                const text = await res.text();

                if (res.status === 200) {
                    setIsVerified(true);
                    setShowVerification(false);
                    setResultMessage(text);
                    setVerificationError('');
                } else if (res.status === 401) {
                    setVerificationError("인증번호가 일치하지 않습니다.");
                } else if (res.status === 400) {
                    setVerificationError("인증 시간이 만료되었습니다.");
                } else {
                    setVerificationError("오류가 발생했습니다. 관리자에게 문의 부탁드립니다.");
                }
            })
            .catch(() => {
                setVerificationError("서버 오류가 발생했습니다.");
            });
    };

    //kakao 우편번호
    const [postalCode, setPostalCode] = useState('');
    const [address, setAddress] = useState('');
    const [extraAddress, setExtraAddress] = useState('');
    const [detailAddress, setDetailAddress] = useState('');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const handlePostcodeSearch  = () => {
        new window.daum.Postcode({
            oncomplete: function (data) {
                let addr = ''; // 주소
                let extraAddr = ''; // 참고항목

                //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === 'R') { // 사용자가 도로명 주소를 선택했을 경우
                    addr = data.roadAddress;
                } else { // 사용자가 지번 주소를 선택했을 경우(J)
                    addr = data.jibunAddress;
                }

                // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
                if (data.userSelectedType === 'R') {
                    // 법정동명이 있을 경우 추가한다. (법정리는 제외)
                    // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
                    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
                        extraAddr += data.bname;
                    }
                    // 건물명이 있고, 공동주택일 경우 추가한다.
                    if (data.buildingName !== '' && data.apartment === 'Y') {
                        extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
                    }
                    // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
                    if (extraAddr !== '') {
                        extraAddr = ' (' + extraAddr + ')';
                    }
                }

                setPostalCode(data.zonecode);
                setAddress(addr);
                setExtraAddress(extraAddr);
                document.getElementById("detailAddressInput")?.focus();
            }
        }).open();
    };



    const handleSubmit = () => {
        if (!isVerified) {
            Swal.fire({
                icon: 'warning',
                title: '이메일 인증 필요',
                text: '이메일 인증을 완료해주세요.',
                confirmButtonText: '확인',
                confirmButtonColor: '#d33'
            });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: '비밀번호 불일치',
                text: '비밀번호가 일치하지 않습니다.',
                confirmButtonText: '확인',
                confirmButtonColor: '#d33'
            });
            return;
        }

        // 모든 필수 필드 검증
        const requiredFields = ['email', 'password', 'name', 'birthYear', 'birthMonth', 'birthDay', 'phoneNumber1', 'phoneNumber2', 'gender', 'nickname'];
        const emptyFields = requiredFields.filter(field => !formData[field]);

        if (emptyFields.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: '필수 정보 누락',
                text: '모든 필수 항목을 입력해주세요.',
                confirmButtonText: '확인',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        if (!postalCode || !address) {
            Swal.fire({
                icon: 'warning',
                title: '주소 누락',
                text: '우편번호 찾기를 눌러 주소를 입력해주세요.',
                confirmButtonText: '확인',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        const signupData = {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            birthYear: formData.birthYear,
            birthMonth: formData.birthMonth,
            birthDay: formData.birthDay,
            phonePrefix: formData.phonePrefix,
            phoneNumber: formData.phoneNumber1 + formData.phoneNumber2,
            gender: formData.gender,
            nickname: formData.nickname,
            address: `${address} ${detailAddress} ${extraAddress}`.trim()
        };

        fetch("http://localhost:8080/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(signupData)
        })
            .then(async res => {

                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: '회원가입 완료!',
                        text: '회원가입이 성공적으로 완료되었습니다.',
                        confirmButtonText: '확인',
                        confirmButtonColor: '#28a745'
                    }).then(() => {
                        window.location.href = "/login"; // 로그인 페이지로 이동
                    });
                } else {
                    const text = await res.text();
                    Swal.fire({
                        icon: 'error',
                        title: '회원가입 실패',
                        text: text || '오류가 발생했습니다.',
                        confirmButtonText: '확인',
                        confirmButtonColor: '#d33'
                    });
                }
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: '서버 오류',
                    text: '회원가입 요청 중 오류가 발생했습니다.',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#d33'
                });
            });
    };


    return (
        <Layout>
            <div className="membershipContainer">
                <div className="membershipFormWrapper">
                    <div className="membershipHeader">
                        <h2 className="tagline">회원가입</h2>
                    </div>

                    <div className="membershipForm">
                        {/* 이메일 */}
                        <div className="formGroup">
                            <label className="formLabel">이메일</label>
                            <div className="emailVerificationGroup">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="formInput"
                                    placeholder="이메일을 입력하세요"
                                    required
                                />
                                <button onClick={handleEmailVerification}
                                        className="btn btn-no-margin"
                                        disabled={isVerified}>
                                    {isVerified ? "인증완료" : "인증하기"}
                                </button>
                            </div>
                        </div>

                        {resultMessage && (
                            <div className="formGroup">
                                <p style={{ color: isVerified ? 'green' : 'red', fontWeight: 'bold' }}>{resultMessage}</p>
                            </div>
                        )}

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
                                    name="phoneNumber1"
                                    value={formData.phoneNumber1}
                                    onChange={handleInputChange}
                                    className="phoneInput"
                                    placeholder="앞번호"
                                    pattern="[0-9]{4}"
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phoneNumber2"
                                    value={formData.phoneNumber2}
                                    onChange={handleInputChange}
                                    className="phoneInput"
                                    placeholder="뒷번호"
                                    pattern="[0-9]{4}"
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
                                        className="radioInput"
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
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                <input
                                    type="text"
                                    name={postalCode}
                                    value={postalCode}
                                    readOnly
                                    placeholder="우편번호"
                                    className="formInput"
                                    style={{ width: "120px" }}
                                />
                                <button type="button" onClick={handlePostcodeSearch} className="btn btn-no-margin">
                                    우편번호 찾기
                                </button>
                            </div>

                            <input
                                type="text"
                                name={address}
                                value={address}
                                readOnly
                                placeholder="주소"
                                className="formInput"
                                style={{ marginBottom: "8px" }}
                            />

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    id="detailAddressInput"
                                    value={detailAddress}
                                    onChange={(e) => setDetailAddress(e.target.value)}
                                    placeholder="상세주소"
                                    className="formInput"
                                />
                                <input
                                    type="text"
                                    name={extraAddress}
                                    value={extraAddress}
                                    readOnly
                                    placeholder="참고항목"
                                    className="formInput"
                                />
                            </div>
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

                    <div className="login-link">
                        <a
                            href="/"
                            className="loginLinkAnchor"
                        >
                            이미 계정이 있으시나요? 로그인
                        </a>
                    </div>
                </div>
            </div>

            <EmailVerification
                isOpen={showVerification}
                onClose={() => setShowVerification(false)}
                onConfirm={handleCodeVerify}
                code={verificationCode}
                onCodeChange={handleCodeChange}
                errorMessage={verificationError}
            />
        </Layout>
    );
};

export default Membership;