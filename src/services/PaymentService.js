import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// 공통 axios 인스턴스 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * 결제 정보 저장 요청
 * @param {Object} paymentData - impUid, merchantUid, paymentMethodId, totalPrice 등
 */
export const savePayment = async (paymentData) => {
  try {
    console.log("[savePayment] 요청 payload:", paymentData);
    const response = await apiClient.post("/api/payments/save", paymentData);
    console.log("[savePayment] 응답:", response.data);
    return response.data;
  } catch (error) {
    console.error("[savePayment] 오류:", error.response || error.message);
    throw error;
  }
};

/**
 * 중복 방지용 캐시: userId -> Promise 저장
 */
const paymentCache = new Map();

/**
 * 사용자별 결제 내역 조회 (중복 호출 방지 포함)
 * @param {number} userId
 */
export const fetchPaymentsByUser = async (userId) => {
  if (paymentCache.has(userId)) {
    console.log(`[fetchPaymentsByUser] 중복 호출 방지 → 캐시 재사용 (userId: ${userId})`);
    return paymentCache.get(userId);
  }

  const request = apiClient
      .get(`/api/payments/user/${userId}`)
      .then((res) => {
        paymentCache.delete(userId); // 완료 후 캐시 제거
        return res.data;
      })
      .catch((err) => {
        paymentCache.delete(userId); // 실패 시도도 제거
        throw err;
      });

  paymentCache.set(userId, request);
  console.log(`[fetchPaymentsByUser] 호출 실행 (userId: ${userId})`);

  return request;
};

/**
 * 환불 처리 (DB 기준 상태 변경)
 * @param {number} paymentId
 */
export const cancelPayment = async (paymentId) => {
  try {
    const response = await apiClient.post(`/api/payments/cancel/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("[cancelPayment] 오류:", error.response || error.message);
    throw error;
  }
};

// 추후 확장 대비 export default로 묶어도 가능
export default {
  savePayment,
  fetchPaymentsByUser,
  cancelPayment
};
