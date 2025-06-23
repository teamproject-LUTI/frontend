import React, { useEffect, useState } from "react";
import {
  fetchPaymentsByUser,
  cancelPayment,
  fetchPaymentsByPriceAsc,
  fetchPaymentsByPriceDesc,
  fetchPaymentsByDateDesc,
  fetchPaymentsByState,
  fetchPaymentsByDateRange
} from "../../services/PaymentService";
import axios from "axios";
import { getPaymentMethodName } from "../../util/paymentMethodMap";
import "../../styles/payment/PaymentHistoryTable.css";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);
dayjs.locale("ko");

const PaymentHistoryTable = () => {
  const [payments, setPayments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOption, setSortOption] = useState("date-desc"); // 기본값: 최신순

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setUserId(res.data.user.userId);
    } catch (err) {
      console.error(" 사용자 정보 조회 실패:", err);
      alert("로그인이 필요합니다.");
    }
  };

  const fetchData = async (uid) => {
    if (!uid) return;
    try {
      setLoading(true);
      let data = [];

      let startDate = null;
      let endDate = null;
      if (dateFilter === "7days") {
        startDate = dayjs().subtract(7, "day").toISOString();
        endDate = dayjs().toISOString();
      } else if (dateFilter === "30days") {
        startDate = dayjs().subtract(30, "day").toISOString();
        endDate = dayjs().toISOString();
      }

      if (statusFilter !== "all") {
        const state = parseInt(statusFilter, 10);
        data = await fetchPaymentsByState(uid, state);
      } else if (dateFilter !== "all") {
        data = await fetchPaymentsByDateRange(uid, startDate, endDate);
      } else {
        data = await fetchPaymentsByUser(uid);
      }

      // 정렬 처리
      if (sortOption === "price-asc") {
        data.sort((a, b) => a.totalPrice - b.totalPrice);
      } else if (sortOption === "price-desc") {
        data.sort((a, b) => b.totalPrice - a.totalPrice);
      } else {
        data.sort((a, b) => {
          const dateA = dayjs(a.paymentDate);
          const dateB = dayjs(b.paymentDate);
          if (!dateA.isValid() || !dateB.isValid()) return 0;
          return dateB.valueOf() - dateA.valueOf();
        });
      }

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
  }, [userId, statusFilter, dateFilter, sortOption]);

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

  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
    setSortOption("date-desc");
    fetchData(userId);
  };

  const paginatedData = payments.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  if (loading) return <div className="loading-container">결제 내역을 불러오는 중...</div>;

  return (
      <div>
        <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">전체 상태</option>
            <option value="0">결제 완료</option>
            <option value="1">환불</option>
          </select>

          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">전체 기간</option>
            <option value="7days">최근 7일</option>
            <option value="30days">최근 30일</option>
          </select>

          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="date-desc">최신순</option>
            <option value="price-desc">금액 높은 순</option>
            <option value="price-asc">금액 낮은 순</option>
          </select>

          <button onClick={handleResetFilters}>초기화</button>
        </div>

        <table className="payment-table">
          <thead>
          <tr>
            <th>No</th>
            <th>결제일시</th>
            <th>금액</th>
            <th>결제상태</th>
            <th>환불</th>
          </tr>
          </thead>
          <tbody>
          {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-data">결제 내역이 없습니다.</td>
              </tr>
          ) : (
              paginatedData.map((payment, index) => (
                  <tr key={payment.paymentId}>
                    <td>{(page - 1) * itemsPerPage + index + 1}</td>
                    <td>{dayjs(payment.paymentDate).format("YYYY년 M월 D일 A h시 mm분")}</td>
                    <td className="amount">{payment.totalPrice.toLocaleString()}₩</td>
                    <td className={payment.paymentState === 0 ? "status-completed" : "status-cancelled"}>
                      {payment.paymentState === 0 ? "결제 완료" : "결제 취소"}
                    </td>
                    <td>
                      {payment.paymentState === 0 ? (
                          <button onClick={() => handleCancel(payment.paymentId)}>환불</button>
                      ) : (
                          "-"
                      )}
                    </td>
                  </tr>
              ))
          )}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => (
              <button
                  key={i + 1}
                  className={page === i + 1 ? 'active' : ''}
                  onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>다음</button>
        </div>
      </div>
  );
};

export default PaymentHistoryTable;