import React from 'react';
import '../../styles/common/LutiModal.css';

const LutiModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="luti-modal-overlay" onClick={onClose}>
            <div className="luti-modal-box" onClick={(e) => e.stopPropagation()}>
                <button className="luti-close-btn" onClick={onClose}>×</button>
                <h2 className="luti-title">{title}</h2>
                <p className="luti-message">{message}</p>
                <div className="luti-btns">
                    <button className="luti-cancel-btn" onClick={onClose}>취소</button>
                    <button className="luti-confirm-btn" onClick={onConfirm}>확인</button>
                </div>
            </div>
        </div>
    );
};

export default LutiModal;