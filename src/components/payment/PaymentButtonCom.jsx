import React from "react";
import { useNavigate } from "react-router-dom";
import { savePaymentWithReservation } from "../../services/PaymentService";
import { paymentMethodMap } from "../../util/paymentMethodMap";
import "../../styles/payment/PaymentHistoryTable.css";

const PaymentButtonCom = ({ paymentMethod, onPaymentComplete }) => {
    const navigate = useNavigate();
    const totalAmount = 100;
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

    const handlePayment = () => {
        if (!userInfo) {
            alert("사용자 정보가 없습니다. 로그인 후 다시 시도해주세요.");
            return;
        }

        if (!window.IMP) {
            alert("아임포트 모듈이 로드되지 않았습니다.");
            return;
        }

        const IMP = window.IMP;
        IMP.init(process.env.REACT_APP_IMP_KEY);

        IMP.request_pay(
            {
                pg: "html5_inicis",
                pay_method: paymentMethod,
                merchant_uid: `mid_${new Date().getTime()}`,
                name: `테스트 숙박 - 1박`,
                amount: totalAmount,
                buyer_email: userInfo.email,
                buyer_name: userInfo.name,
                buyer_tel: userInfo.phone,
            },
            async (rsp) => {
                if (!rsp.success) {
                    console.error("아임포트 결제 실패:", rsp);
                    alert("결제가 실패했습니다: " + (rsp.error_msg || "알 수 없는 오류"));
                    return;
                }

                const paymentMethodId = paymentMethodMap[paymentMethod];
                const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);

                const paymentData = {
                    userId: userInfo.userId,
                    impUid: rsp.imp_uid,
                    merchantUid: rsp.merchant_uid,
                    paymentMethodId,
                    totalPrice: totalAmount,
                    paymentDate: nowKST.toISOString(),
                };

                const reservationData = {
                    paymentOwnno: 999001,
                    accomodationInformationId: 1,
                    userId: userInfo.userId,
                    price: totalAmount,
                    accomoStart: "2025-07-10",
                    accomoEnd: "2025-07-11",
                    userCount: 1,
                    roomType: "테스트룸"
                };

                const paymentWithReservationData = {
                    payment: paymentData,
                    reservation: reservationData
                };

                console.log("📦 백엔드로 전송할 데이터:", paymentWithReservationData);

                try {
                    const saved = await savePaymentWithReservation(paymentWithReservationData);
                    console.log("백엔드 저장 성공:", saved);

                    if (window.addNewPayment) {
                        await window.addNewPayment();
                    }

                    alert("결제 및 예약 저장 완료");
                    onPaymentComplete?.();
                    navigate("/mypage/payments");
                } catch (error) {
                    console.error("결제 정보 저장 실패:", error);
                    alert("결제 저장 실패: " + (error.response?.data?.message || error.message));
                }
            }
        );
    };

    return (
        <button onClick={handlePayment} className="payment-button">
            결제하기 ({totalAmount.toLocaleString()}₩)
        </button>
    );
};

export default PaymentButtonCom;
