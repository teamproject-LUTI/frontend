import React, { useEffect, useState } from 'react';
import PaymentButtonCom from "../../components/payment/PaymentButtonCom";
import PaymentHistoryTable from "../../components/payment/PaymentHistoryTable";
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const Payment = () => {
  const [userInfo, setUserInfo] = useState(null);

  // 사용자 정보 로딩
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true,
        });

        if (res.data.success && res.data.user) {
          setUserInfo(res.data.user);
          sessionStorage.setItem("userInfo", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error("사용자 정보 불러오기 실패:", err);
        alert("사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.");
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="main-layout">
      <div className="main-content-wrapper">
        <main className="main-content">
          <h1>💳 결제 내역 페이지</h1>

          {userInfo && (
            <PaymentButtonCom
              userInfo={userInfo}
              paymentMethod="card"
              onPaymentComplete={() => console.log("결제 완료")}
            />
          )}

          <div className="payment-history-section">
            <h2>📋 결제 내역</h2>
            <PaymentHistoryTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Payment;
