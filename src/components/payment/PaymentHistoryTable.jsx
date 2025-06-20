import React, { useEffect, useState } from "react";
import { fetchPaymentsByUser, cancelPayment } from "../../../../luti/workspace/frontend/src/services/PaymentService";
import axios from "axios";
import { getPaymentMethodName } from "../../../../luti/workspace/frontend/src/util/paymentMethodMap";
import "../../../../luti/workspace/frontend/src/styles/payment/PaymentHistoryTable.css";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);
dayjs.locale("ko");

const PaymentHistoryTable = () => {
  const [payments, setPayments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        withCredentials: true
      });
      setUserId(res.data.user.userId);
    } catch (err) {
      console.error(" 사용자 정보 조회 실패:", err);
      alert("로그인이 필요합니다.");
    }
  };

  const fetchData = async (uid) => {
    try {
      const data = await fetchPaymentsByUser(uid);
      setPayments(data);
    } catch (error) {
      console.error(" 결제 내역 불러오기 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      fetchData(userId);
      window.addNewPayment = () => fetchData(userId);
    }
    return () => {
      window.addNewPayment = null;
    };
  }, [userId]);

  const handleCancel = async (paymentId) => {
    if (!window.confirm("정말 이 결제를 환불 처리하시겠습니까?")) return;
    try {
      await cancelPayment(paymentId);
      alert("환불 처리가 완료되었습니다.");
      fetchData(userId);
    } catch (error) {
      console.error("환불 실패:", error);
      alert("환불 처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div className="loading-container">결제 내역을 불러오는 중...</div>;

  return (
      <div>
        <table className="payment-table">
          <thead>
          <tr>
            <th>No</th>
            <th>결제일</th>
            <th>금액</th>
            <th>결제수단</th>
            <th>상태</th>
            <th>환불</th>
          </tr>
          </thead>
          <tbody>
          {payments.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-data">결제 내역이 없습니다.</td>
              </tr>
          ) : (
              payments.map((payment, index) => {
                console.log("✅ payment 전체 확인:", payment); // 전체 로그 출력
                return (
                    <tr key={payment.paymentId}>
                      <td>{index + 1}</td>
                      <td>{dayjs(payment.paymentDate).format("YYYY년 M월 D일 A h시 mm분")}</td>
                      <td className="amount">{payment.totalPrice.toLocaleString()}₩</td>
                      <td>{getPaymentMethodName(payment.paymentMethodId)}</td>
                      <td className={payment.paymentState === 0 ? "status-completed" : "status-cancelled"}>
                        {payment.paymentState === 0 ? "완료" : "취소됨"}
                      </td>
                      <td>
                        {payment.paymentState === 0 ? (
                            <button onClick={() => handleCancel(payment.paymentId)}>환불</button>
                        ) : (
                            "-"
                        )}
                      </td>
                    </tr>
                );
              })
          )}
          </tbody>
        </table>
      </div>
  );
};

export default PaymentHistoryTable;
