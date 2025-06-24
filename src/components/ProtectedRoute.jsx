import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../util/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const [shouldRedirect, setShouldRedirect] = useState(false);

    // 복구 페이지는 특별 처리
    const isRestorePage = location.pathname === '/account/restore';

    useEffect(() => {
        // 로딩이 완료되고 인증되지 않은 경우
        if (!isLoading && !isAuthenticated) {
            // 복구 페이지가 아닌 경우에만 리다이렉트
            if (!isRestorePage) {
                console.log('인증 실패 - 로그인 페이지로 이동');
                setShouldRedirect(true);
            } else {
                console.log('복구 페이지 - 인증 실패 허용');
                setShouldRedirect(false);
            }
        } else {
            setShouldRedirect(false);
        }
    }, [isLoading, isAuthenticated, isRestorePage]);

    // 로딩 중이면 로딩 화면 표시
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #F76B59',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <p style={{ marginTop: '16px', color: '#666' }}>인증 확인 중...</p>
                <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    // 복구 페이지는 인증 여부와 관계없이 접근 허용
    if (isRestorePage) {
        return children;
    }

    // 일반 페이지는 인증된 경우에만 접근 허용
    if (shouldRedirect) {
        return <Navigate to="/" replace />;
    }

    if (isAuthenticated) {
        return children;
    }

    // 기본적으로 로그인 페이지로 리다이렉트
    return <Navigate to="/" replace />;
};

export default ProtectedRoute;
