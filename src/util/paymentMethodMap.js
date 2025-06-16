// 결제 방식 → 코드
export const paymentMethodMap = {
    card: 1,
    kakao: 2,
    naver: 3,
    toss: 4,
  };
  
  // 코드 → 한글명 변환 함수
  export const getPaymentMethodName = (code) => {
    const entry = Object.entries(paymentMethodMap).find(([_, val]) => val === code);
    if (!entry) return '기타';
  
    switch (entry[0]) {
      case 'card': return '카드';
      case 'kakao': return '카카오페이';
      case 'naver': return '네이버페이';
      case 'toss': return '토스';
      default: return '기타';
    }
  };
  