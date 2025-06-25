import React, { useEffect, useState } from "react";
import {
  fetchPaymentsByUser,
  cancelPayment,
  fetchPaymentsByState
} from "../../services/PaymentService";
import axios from "axios";
import "../../styles/payment/PaymentHistoryTable.css";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import localizedFormat from "dayjs/plugin/localizedFormat";

// dayjs 설정
dayjs.extend(localizedFormat);
dayjs.locale("ko");

const PaymentHistoryTable = () => {
  // 기본 상태
  const [payments, setPayments] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortOption, setSortOption] = useState("date-desc");
  const [searchDate, setSearchDate] = useState("");

  /**
   * 현재 로그인한 사용자 정보 조회
   */
  const fetchUser = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        withCredentials: true,
      });
      setUserId(res.data.user.userId);
    } catch (err) {
      console.error("사용자 정보 조회 실패:", err);
      alert("로그인이 필요합니다.");
    }
  };

  /**
   * 결제 내역 데이터 조회 및 필터링
   * @param {number} uid - 사용자 ID
   */
  const fetchData = async (uid) => {
    if (!uid) return;

    try {
      setLoading(true);
      let data = [];

      // 1. API에서 데이터 조회
      if (statusFilter !== "all") {
        // 결제 상태별 조회 (결제완료/환불)
        const state = parseInt(statusFilter, 10);
        data = await fetchPaymentsByState(uid, state);
      } else {
        // 전체 결제 내역 조회
        data = await fetchPaymentsByUser(uid);
      }

      // 2. 클라이언트 사이드 날짜 필터링
      if (dateFilter === "7days") {
        const sevenDaysAgo = dayjs().subtract(7, "day").startOf('day');
        data = data.filter(p => dayjs(p.paymentDate).isAfter(sevenDaysAgo));
      } else if (dateFilter === "30days") {
        const thirtyDaysAgo = dayjs().subtract(30, "day").startOf('day');
        data = data.filter(p => dayjs(p.paymentDate).isAfter(thirtyDaysAgo));
      }

      // 3. 특정 날짜 검색 필터링
      if (searchDate !== "") {
        data = data.filter(p => {
          const paymentDate = dayjs(p.paymentDate).format("YYYY-MM-DD");
          return paymentDate === searchDate;
        });
      }

      // 4. 정렬
      if (sortOption === "price-asc") {
        data.sort((a, b) => a.totalPrice - b.totalPrice);
      } else if (sortOption === "price-desc") {
        data.sort((a, b) => b.totalPrice - a.totalPrice);
      } else {
        // 기본: 최신순 정렬
        data.sort((a, b) => dayjs(b.paymentDate) - dayjs(a.paymentDate));
      }

      setPayments(data);
    } catch (error) {
      console.error("결제 내역 불러오기 실패:", error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 결제 환불 처리
   * @param {number} paymentId - 결제 ID
   */
  const handleCancel = async (paymentId) => {
    if (!window.confirm("정말 이 결제를 환불 처리하시겠습니까?")) return;

    try {
      await cancelPayment(paymentId);
      alert("환불 처리가 완료되었습니다.");
      fetchData(userId); // 데이터 새로고침
    } catch (error) {
      console.error("환불 실패:", error);
      alert("환불 처리 중 오류가 발생했습니다.");
    }
  };

  /**
   * 모든 필터 초기화
   */
  const handleResetFilters = () => {
    setStatusFilter("all");
    setDateFilter("all");
    setSortOption("date-desc");
    setSearchDate("");
  };

  // 컴포넌트 마운트 시 사용자 정보 조회
  useEffect(() => {
    fetchUser();
  }, []);

  // 사용자 ID나 필터 변경 시 데이터 재조회
  useEffect(() => {
    if (userId !== null) {
      fetchData(userId);

      // 결제 완료 후 새로고침을 위한 전역 함수 등록
      window.addNewPayment = () => fetchData(userId);
    }

    return () => {
      window.addNewPayment = null;
    };
  }, [userId, statusFilter, dateFilter, sortOption, searchDate]);

  // 페이지네이션 계산
  const paginatedData = payments.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  // 로딩 상태 표시
  if (loading) {
    return <div className="loading-container">결제 내역을 불러오는 중...</div>;
  }

  return (
      <div>
        {/* 필터 컨트롤 */}
        <div className="payment-filters">
          {/* 결제 상태 필터 */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">전체 상태</option>
            <option value="0">결제 완료</option>
            <option value="1">환불</option>
          </select>

          {/* 날짜 범위 필터 */}
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">전체 기간</option>
            <option value="7days">최근 7일</option>
            <option value="30days">최근 30일</option>
          </select>

          {/* 정렬 옵션 */}
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="date-desc">최신순</option>
            <option value="price-desc">금액 높은 순</option>
            <option value="price-asc">금액 낮은 순</option>
          </select>

          {/* 특정 날짜 검색 */}
          <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="payment-date-input"
          />

          {/* 필터 초기화 버튼 */}
          <button className="payment-reset-button" onClick={handleResetFilters}>
            필터 초기화
          </button>
        </div>

        {/* 결제 내역 테이블 */}
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
                <td colSpan="5" className="empty-data">
                  {dateFilter !== "all" ? (
                      <>
                        선택한 기간에 결제 내역이 없습니다.<br />
                        <small style={{ color: '#999' }}>
                          다른 기간을 선택하거나 전체 기간으로 조회해보세요.
                        </small>
                      </>
                  ) : (
                      "결제 내역이 없습니다."
                  )}
                </td>
              </tr>
          ) : (
              paginatedData.map((payment, index) => (
                  <tr key={payment.paymentId}>
                    <td>{(page - 1) * itemsPerPage + index + 1}</td>
                    <td>{dayjs(payment.paymentDate).format("YYYY년 M월 D일 A h시 mm분")}</td>
                    <td className="amount">{payment.totalPrice?.toLocaleString() || 'N/A'}₩</td>
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

        {/* 페이지네이션 */}
        {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                  <button
                      key={i + 1}
                      className={page === i + 1 ? 'active' : ''}
                      onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                다음
              </button>
            </div>
        )}
      </div>
  );
};

export default PaymentHistoryTable;