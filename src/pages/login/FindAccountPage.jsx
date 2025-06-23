import React, {useEffect, useState} from 'react';
import '../../styles/login/FindAccount.css';
import Swal from 'sweetalert2';
import EmailVerification from '../../components/login/EmailVerification';
import Topbar from "../../components/layout/Topbar";

const FindAccountPage = () => {
    const [activeTab, setActiveTab] = useState('findId'); // 'findId' 또는 'findPassword'

    const [idForm, setIdForm] = useState({name: '', phoneNumber: ''});
    const [pwForm, setPwForm] = useState({name: '', email: ''});
    const [foundUser, setFoundUser] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationError, setVerificationError] = useState('');
    const [resultMessage, setResultMessage] = useState('');


    const handleIdSubmit = async (e) => {
        e.preventDefault();

        const {name, phoneNumber} = idForm;

        // 이름 미입력 체크
        if (!idForm.name) {
            Swal.fire({icon: 'warning', text: '이름을 입력해주세요.'});
            return;
        }

        // 휴대폰 번호 미입력 체크
        if (!idForm.phoneNumber) {
            Swal.fire({icon: 'warning', text: '휴대폰번호를 입력해주세요.'});
            return;
        }

        // 자리수 체크
        if (!/^\d{11}$/.test(phoneNumber)) {
            Swal.fire({icon: 'warning', text: "휴대폰 번호는 숫자 11자리여야 합니다."});
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/account/find-email', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({name, phoneNumber}),
            });

            const result = await response.json();

            if (response.ok) {
                // 서버에서 받은 사용자 정보 저장
                setFoundUser({loginEmail: result.email});

                Swal.fire({
                    icon: 'success',
                    title: '아이디 찾기 완료',
                    html: `
                        <p><strong>회원님의 아이디:</strong></p>
                        <p style="font-size: 1.2rem; margin-top: 8px; color: #333;"><strong>${result.email}</strong></p>
                    `,
                    confirmButtonText: '확인'
                });
            } else {
                Swal.fire({icon: 'error', text: result.message});
            }
        } catch (error) {
            Swal.fire({icon: 'error', text: '요청 중 오류가 발생했습니다.'});
        }
    };

    const handlePwSubmit = async (e) => {
        e.preventDefault();

        if (!pwForm.name || !pwForm.email) {
            Swal.fire({icon: 'warning', text: '이름과 이메일을 입력해주세요.'});
            return;
        }

        if (!isVerified) {
            Swal.fire({icon: 'warning', text: '이메일 인증을 먼저 완료해주세요.'});
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/account/find-password', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include', // 세션 공유
                body: JSON.stringify({
                    email: pwForm.email,
                    name: pwForm.name
                })
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    text: result.message || '임시 비밀번호가 이메일로 전송되었습니다.'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    text: result.message || '비밀번호 재설정 실패'
                });
            }
        } catch (error) {
            Swal.fire({icon: 'error', text: '요청 중 오류가 발생했습니다.'});
        }
    };

    const isValidEmailFormat = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailVerification = () => {
        if (!pwForm.email) {
            Swal.fire({icon: 'warning', text: '이메일을 입력해주세요.'});
            return;
        }

        if (!isValidEmailFormat(pwForm.email)) {
            Swal.fire({icon: 'warning', text: '이메일 형식이 올바르지 않습니다.'});
            return;
        }

        fetch("http://localhost:8080/api/account/email/code", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: 'include',
            body: JSON.stringify({
                email: pwForm.email,
                name: pwForm.name,
                checkType: "MATCH_NAME"
            })
        })
            .then(async res => {
                const msg = await res.text();

                if (res.ok) {
                    Swal.fire({icon: 'info', text: msg});
                    setShowVerification(true); // 인증코드 입력 모달 열기
                } else {
                    Swal.fire({icon: 'error', text: msg});
                }
            })
            .catch(() => Swal.fire({icon: 'error', text: '이메일 전송 실패'}));
    };

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

    const handleCodeVerify = () => {
        fetch(`http://localhost:8080/api/account/email/verify?code=${verificationCode}`, {
            method: "GET",
            credentials: 'include'
        })
            .then(async res => {
                const msg = await res.text();

                if (res.status === 200) {
                    Swal.fire({
                        icon: 'success',
                        text: '이메일 인증이 완료되었습니다.'
                    });
                    setIsVerified(true); // 인증 완료 상태
                    setShowVerification(false);
                    setVerificationError('')
                } else if (res.status === 401) {
                    setVerificationError("인증번호가 일치하지 않습니다.");
                } else if (res.status === 400) {
                    setVerificationError("인증 시간이 만료되었습니다.");
                } else {
                    setVerificationError("오류가 발생했습니다. 관리자에게 문의 부탁드립니다.");
                }
            })
            .catch(() => Swal.fire({icon: 'error', text: '인증 실패'}));
    };


    return (
        <div>
            <Topbar />
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
                                onChange={(e) => setIdForm({...idForm, name: e.target.value})}
                            />
                            <input
                                type="text"
                                placeholder="휴대폰 번호('-'제외)"
                                value={idForm.phoneNumber}
                                onChange={(e) => setIdForm({...idForm, phoneNumber: e.target.value})}
                            />
                            <button type="submit" className="submit-btn">확인</button>
                        </form>
                    )}

                    {activeTab === 'findPassword' && (
                        <form onSubmit={handlePwSubmit} className="find-account-form">
                            <input
                                type="text"
                                placeholder="이름"
                                value={pwForm.name}
                                onChange={(e) => setPwForm({...pwForm, name: e.target.value})}
                                required
                            />
                            <div className="email-verification-group">
                                <input
                                    type="email"
                                    placeholder="가입 이메일"
                                    value={pwForm.email}
                                    onChange={(e) => setPwForm({...pwForm, email: e.target.value})}
                                    required
                                />
                                <button
                                    type="button"
                                    className="verify-btn"
                                    onClick={handleEmailVerification}
                                    disabled={isVerified}>
                                    {isVerified ? "인증완료" : "인증하기"}
                                </button>
                            </div>
                            <button type="submit" className="submit-btn">확인</button>
                        </form>
                    )}
                </div>
            </div>
            <EmailVerification
                isOpen={showVerification}
                onClose={() => setShowVerification(false)}
                onConfirm={handleCodeVerify}
                code={verificationCode}
                onCodeChange={(e) => setVerificationCode(e.target.value)}
                errorMessage={verificationError}
            />
        </div>

    );
};

export default FindAccountPage;
