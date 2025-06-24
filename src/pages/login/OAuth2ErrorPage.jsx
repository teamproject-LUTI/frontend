import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

/**
 * OAuth2 로그인 실패 시 모달로 간단하게 처리하는 컴포넌트
 */
const OAuth2ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL 파라미터에서 에러 정보 추출
  const errorCode = searchParams.get('error');
  const errorMessage = searchParams.get('message');
  const provider = searchParams.get('provider') || 'social';

  console.log('OAuth2ErrorPage - 파라미터:', { errorCode, errorMessage, provider });

  useEffect(() => {
    const showErrorModal = async () => {
      // 제공자별 이름 매핑
      const getProviderName = (providerCode) => {
        switch (providerCode?.toLowerCase()) {
          case 'google':
            return '구글';
          case 'kakao':
            return '카카오';
          case 'naver':
            return '네이버';
          default:
            return '소셜';
        }
      };

      // 이메일 중복 에러 감지
      const isEmailDuplicateError = errorCode && (
          errorCode.includes('이미') ||
          errorCode.includes('가입') ||
          errorCode.includes('email') ||
          errorCode.includes('duplicate') ||
          errorCode === 'email_already_exists' ||
          errorCode.includes('계정이 있습니다')
      );

      const providerName = getProviderName(provider);

      if (isEmailDuplicateError) {
        // 이메일 중복 에러 - 상세 안내 모달
        const result = await Swal.fire({
          title: '이미 가입된 이메일입니다',
          html: `
            <div style="text-align: left; line-height: 1.6;">
              <p style="margin-bottom: 15px;">
                <strong>${providerName} 계정의 이메일로 이미 가입된 계정이 있습니다.</strong>
              </p>
              
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9; margin: 15px 0;">
                <h4 style="margin: 0 0 10px 0; color: #0c4a6e; font-size: 14px;">💡 해결 방법</h4>
                <ul style="margin: 0; padding-left: 20px; color: #075985; font-size: 13px;">
                  <li><strong>기존 계정으로 로그인:</strong> 이메일과 비밀번호로 일반 로그인을 사용하세요</li>
                  <li><strong>다른 계정 사용:</strong> 다른 ${providerName} 계정으로 로그인하세요</li>
                  <li><strong>계정 연동 문의:</strong> 고객지원에 문의하여 계정 연동을 요청하세요</li>
                </ul>
              </div>
              
              <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
                보안상의 이유로 하나의 이메일 주소는 하나의 계정에만 연결될 수 있습니다.
              </p>
            </div>
          `,
          icon: 'warning',
          confirmButtonText: '로그인 페이지로',
          confirmButtonColor: '#F76B59',
          showCancelButton: true,
          cancelButtonText: '고객지원 문의',
          cancelButtonColor: '#6b7280',
          width: '500px',
          customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-html'
          }
        });

        if (result.isConfirmed) {
          // 로그인 페이지로 이동
          navigate('/', { replace: true });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // 고객지원 문의
          window.location.href = 'mailto:support@luti.com?subject=소셜 로그인 계정 연동 문의';
          // 이메일 열고 나서 로그인 페이지로 이동
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        } else {
          // ESC 키나 X 버튼으로 닫은 경우
          navigate('/', { replace: true });
        }
      } else {
        // 일반적인 OAuth2 에러 - 간단한 알림 모달
        let title = '로그인 오류';
        let message = '소셜 로그인 중 오류가 발생했습니다.';

        if (errorCode) {
          if (errorCode.includes('access_denied')) {
            title = '로그인이 취소되었습니다';
            message = `${providerName} 로그인 과정에서 권한 승인을 거부하셨습니다.`;
          } else if (errorCode.includes('server_error')) {
            title = '서버 오류';
            message = '일시적인 서버 문제로 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.';
          } else if (errorCode.includes('invalid_request')) {
            title = '잘못된 요청';
            message = '로그인 요청에 문제가 있습니다. 페이지를 새로고침하고 다시 시도해주세요.';
          } else {
            message = errorMessage ? decodeURIComponent(errorMessage) : errorCode;
          }
        }

        await Swal.fire({
          title: title,
          text: message,
          icon: 'error',
          confirmButtonText: '다시 로그인하기',
          confirmButtonColor: '#F76B59',
          allowOutsideClick: false,
          allowEscapeKey: true
        });

        // 로그인 페이지로 이동
        navigate('/', { replace: true });
      }
    };

    // 컴포넌트 마운트 후 모달 표시
    showErrorModal();
  }, [errorCode, errorMessage, provider, navigate]);

  // 모달이 표시되는 동안 보여줄 로딩 화면
  return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #F76B59',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#6b7280', margin: 0 }}>처리 중...</p>
        </div>

        <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .swal-custom-popup {
          border-radius: 12px !important;
        }
        
        .swal-custom-title {
          font-size: 18px !important;
          font-weight: 600 !important;
        }
        
        .swal-custom-html {
          font-size: 14px !important;
          line-height: 1.5 !important;
        }
      `}</style>
      </div>
  );
};

export default OAuth2ErrorPage;
