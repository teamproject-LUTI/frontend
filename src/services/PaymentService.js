// src/services/PaymentService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

// 공통 axios 인스턴스 설정
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // HttpOnly 쿠키 자동 포함
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * 결제 정보 저장 요청
 * @param {Object} paymentData - impUid, merchantUid, paymentCd, totalPrice, paymentDate 등
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
 * 사용자별 결제 내역 조회
 * @param {number} userId
 */
export const fetchPaymentsByUser = async (userId) => {
  try {
    const response = await apiClient.get(`/api/payments/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error("[fetchPaymentsByUser] 오류:", error.response || error.message);
    throw error;
  }
};

/**
 *  환불 처리 (DB 기준으로 상태 변경)
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
