import React from 'react';
import '../../styles/common/LutiModal.css';

const EmailVerification = ({
                               isOpen,
                               onClose,
                               onConfirm,
                               code,
                               onCodeChange,
                               errorMessage
                           }) => {
    if (!isOpen) return null;

    return (
        <div className="luti-modal-overlay" onClick={onClose}>
            <div className="luti-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="luti-close-btn" onClick={onClose}>×</button>
                <h2 className="luti-title">이메일 인증</h2>
                <p className="luti-message">이메일로 받은 인증번호를 입력해주세요</p>
                <input
                    type="text"
                    className="luti-input"
                    value={code}
                    onChange={onCodeChange}
                    placeholder="인증번호 입력"
                />

                {/* 에러 메시지 표시 */}
                {errorMessage && (
                    <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
                        {errorMessage}
                    </p>
                )}

                <div className="luti-btns">
                    <button className="luti-cancel-btn" onClick={onClose}>취소</button>
                    <button className="luti-confirm-btn" onClick={onConfirm}>확인</button>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;
