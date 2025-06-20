import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
    fetchAllPaymentsByState,
    fetchAllPaymentsByDateRange,
    cancelPayment
} from "../../services/PaymentService";
import "../../styles/management/PaymentManagement.css";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/ko";

dayjs.extend(localizedFormat);
dayjs.locale("ko");

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [filterState, setFilterState] = useState("ALL");
    const [dateRange, setDateRange] = useState("ALL");
    const [sortType, setSortType] = useState("DATE_DESC");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchUserId, setSearchUserId] = useState("");
    const [searchDate, setSearchDate] = useState("");
    const itemsPerPage = 10;

    const DEFAULT_FILTERS = {
        filterState: "ALL",
        dateRange: "ALL",
        sortType: "DATE_DESC",
        currentPage: 1
    };

    useEffect(() => {
        fetchPayments();
    }, [filterState, dateRange, sortType, searchUserId, searchDate]);

    const handleResetFilters = () => {
        setFilterState(DEFAULT_FILTERS.filterState);
        setDateRange(DEFAULT_FILTERS.dateRange);
        setSortType(DEFAULT_FILTERS.sortType);
        setCurrentPage(DEFAULT_FILTERS.currentPage);
        setSearchUserId("");
        setSearchDate("");
    };

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const today = dayjs();
            let start = null, end = null;

            if (dateRange === "7D") {
                start = today.subtract(7, "day").toISOString();
                end = today.toISOString();
            } else if (dateRange === "30D") {
                start = today.subtract(30, "day").toISOString();
                end = today.toISOString();
            }

            let state = null;
            if (filterState === "PAID") state = 0;
            else if (filterState === "REFUNDED") state = 1;

            let data = [];

            if (start && end) {
                if (state === null) {
                    const paid = await fetchAllPaymentsByDateRange(0, start, end);
                    const refunded = await fetchAllPaymentsByDateRange(1, start, end);
                    data = [...paid, ...refunded];
                } else {
                    data = await fetchAllPaymentsByDateRange(state, start, end);
                }
            } else {
                if (state === null) {
                    const paid = await fetchAllPaymentsByState(0);
                    const refunded = await fetchAllPaymentsByState(1);
                    data = [...paid, ...refunded];
                } else {
                    data = await fetchAllPaymentsByState(state);
                }
            }

            const sorted = [...data].sort((a, b) => {
                if (sortType === "DATE_DESC") return dayjs(b.paymentDate) - dayjs(a.paymentDate);
                if (sortType === "PRICE_ASC") return a.totalPrice - b.totalPrice;
                if (sortType === "PRICE_DESC") return b.totalPrice - a.totalPrice;
                return 0;
            });

            // 검색 필터
            let filtered = [...sorted];
            if (searchUserId.trim() !== "") {
                filtered = filtered.filter(p => String(p.userId).includes(searchUserId.trim()));
            }
            if (searchDate !== "") {
                filtered = filtered.filter(p =>
                    dayjs(p.paymentDate).format("YYYY-MM-DD") === searchDate
                );
            }

            setPayments(filtered);
            setCurrentPage(1);
        } catch (err) {
            console.error("결제 목록 로딩 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRefund = async (paymentId) => {
        if (!window.confirm("정말 이 결제를 환불 처리하시겠습니까?")) return;
        try {
            await cancelPayment(paymentId);
            fetchPayments();
        } catch (err) {
            alert("환불 실패: " + err.message);
        }
    };

    const totalCount = payments.length;
    const refundCount = payments.filter((p) => p.paymentState === 1).length;
    const totalAmount = payments.reduce((sum, p) => sum + p.totalPrice, 0);

    const startIdx = (currentPage - 1) * itemsPerPage;
    const pagedPayments = payments.slice(startIdx, startIdx + itemsPerPage);
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <Layout>
            <div className="payment-management-container">
                <div className="payment-stats">
                    <div className="stat-item">
                        <div className="stat-label">총 결제건수</div>
                        <div className="stat-value">{totalCount}건</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">환불 건수</div>
                        <div className="stat-value">{refundCount}건</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">총 결제금액</div>
                        <div className="stat-value">{totalAmount.toLocaleString()}원</div>
                    </div>
                </div>

                <div className="filter-bar">
                    <select onChange={(e) => setFilterState(e.target.value)} value={filterState}>
                        <option value="ALL">전체</option>
                        <option value="PAID">결제 완료</option>
                        <option value="REFUNDED">환불</option>
                    </select>

                    <select onChange={(e) => setDateRange(e.target.value)} value={dateRange}>
                        <option value="ALL">전체 기간</option>
                        <option value="7D">최근 7일</option>
                        <option value="30D">최근 30일</option>
                    </select>

                    <select onChange={(e) => setSortType(e.target.value)} value={sortType}>
                        <option value="DATE_DESC">최신순</option>
                        <option value="PRICE_DESC">금액 높은 순</option>
                        <option value="PRICE_ASC">금액 낮은 순</option>
                    </select>

                    <input
                        type="text"
                        placeholder="사용자 ID 검색"
                        value={searchUserId}
                        onChange={(e) => setSearchUserId(e.target.value)}
                    />
                    <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                    />

                    <button className="reset-button" onClick={handleResetFilters}>초기화</button>
                </div>

                <table className="payment-table">
                    <thead>
                    <tr>
                        <th>순번</th>
                        <th>사용자 ID</th>
                        <th>-</th>
                        <th>결제일시</th>
                        <th>impUid</th>
                        <th>merchantUid</th>
                        <th>결제금액</th>
                        <th>결제 상태</th>
                        <th>환불</th>
                    </tr>
                    </thead>
                    <tbody>
                    {!loading && pagedPayments.length > 0 ? (
                        pagedPayments.map((payment, index) => (
                            <tr key={payment.paymentId}>
                                <td>{startIdx + index + 1}</td>
                                <td>{payment.userId}</td>
                                <td>-</td>
                                <td>{dayjs(payment.paymentDate).format("LLL")}</td>
                                <td>{payment.impUid}</td>
                                <td>{payment.merchantUid}</td>
                                <td>{payment.totalPrice.toLocaleString()}원</td>
                                <td>{payment.paymentState === 1 ? "환불" : "결제 완료"}</td>
                                <td>
                                    {payment.paymentState === 0 && (
                                        <button onClick={() => handleRefund(payment.paymentId)}>환불</button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9">{loading ? "불러오는 중..." : "결제 내역이 없습니다."}</td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={currentPage === i + 1 ? "active" : ""}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default PaymentManagement;
