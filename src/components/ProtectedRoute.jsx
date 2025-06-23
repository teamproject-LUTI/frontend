import React from 'react';
import { useAuth } from '../util/AuthContext';
import { Navigate,Outlet  } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="auth-loading-container">
                <div className="auth-loading-content">
                    <div className="loading-spinner"></div>
                    <p>인증 확인 중...</p>
                </div>

                <style>{`
                .auth-loading-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background-color: #f5f5f5;
                }

                .auth-loading-content {
                    text-align: center;
                    padding: 40px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    max-width: 400px;
                    width: 90%;
                }

                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #4285f4;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                }

                .auth-loading-content p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }

                @keyframes spin {
                    0% {
                        transform: rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg);
                    }
                }
                `}</style>
            </div>
        );
    }

    // 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated) {
        console.log('인증 실패 - 로그인 페이지로 이동');
        return <Navigate to="/" replace />;
    }

    // 인증된 경우 자식 컴포넌트 렌더링
    console.log('인증 성공 - 컴포넌트 렌더링');
    return children ? children : <Outlet />;
};

export default ProtectedRoute;