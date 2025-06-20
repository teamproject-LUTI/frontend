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
 */
export const fetchPaymentsByUser = async (userId) => {
  if (paymentCache.has(userId)) {
    console.log(`[fetchPaymentsByUser] 중복 호출 방지 → 캐시 재사용 (userId: ${userId})`);
    return paymentCache.get(userId);
  }

  const request = apiClient
      .get(`/api/payments/user/${userId}`)
      .then((res) => {
        paymentCache.delete(userId);
        return res.data;
      })
      .catch((err) => {
        paymentCache.delete(userId);
        throw err;
      });

  paymentCache.set(userId, request);
  console.log(`[fetchPaymentsByUser] 호출 실행 (userId: ${userId})`);
  return request;
};

/**
 * 환불 처리 (DB 기준 상태 변경)
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

// 총 결제금액 높은 순으로 조회
export const fetchPaymentsByPriceDesc = async (userId) => {
  const res = await apiClient.get(`/api/payments/user/${userId}/price-desc`);
  return res.data;
};

// 총 결제금액 낮은 순으로 조회
export const fetchPaymentsByPriceAsc = async (userId) => {
  const res = await apiClient.get(`/api/payments/user/${userId}/price-asc`);
  return res.data;
};

// 결제 상태별 조회 (0: 결제, 1: 환불)
export const fetchPaymentsByState = async (userId, state) => {
  const res = await apiClient.get(`/api/payments/user/${userId}/state/${state}`);
  return res.data;
};

// 날짜 범위로 조회 (start, end는 ISO 문자열)
export const fetchPaymentsByDateRange = async (userId, start, end) => {
  const res = await apiClient.get(
      `/api/payments/user/${userId}/range?start=${start}&end=${end}`
  );
  return res.data;
};

// 결제일 최신순으로 조회
export const fetchPaymentsByDateDesc = async (userId) => {
  const res = await apiClient.get(`/api/payments/user/${userId}/date-desc`);
  return res.data;
};

// 모듈 전체 export (선택적)
export default {
  savePayment,
  fetchPaymentsByUser,
  cancelPayment,
  fetchPaymentsByPriceDesc,
  fetchPaymentsByPriceAsc,
  fetchPaymentsByState,
  fetchPaymentsByDateRange,
  fetchPaymentsByDateDesc
};
