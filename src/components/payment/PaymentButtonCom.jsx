import React from "react";
import { useNavigate } from "react-router-dom";
import { savePayment } from "../../services/PaymentService";
import { paymentMethodMap } from "../../util/paymentMethodMap";
import "../../styles/payment/PaymentHistoryTable.css";

const PaymentButtonCom = ({ paymentMethod, onPaymentComplete }) => {
    const navigate = useNavigate();

    // 테스트용 결제 금액 (1박 기준 100원)
    const totalAmount = 100;

    // 세션스토리지에서 사용자 정보 로딩
    const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));

    // 결제 요청 처리
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

                console.log("📦 백엔드로 전송할 결제 데이터:", paymentData);

                try {
                    const savedPayment = await savePayment(paymentData);
                    console.log("백엔드 저장 성공:", savedPayment);

                    if (window.addNewPayment) {
                        console.log("결제내역 테이블 동기화 중...");
                        await window.addNewPayment();
                    }

                    alert("결제 & 저장 완료");
                    onPaymentComplete?.();
                    navigate("/mypage/payments");
                } catch (error) {
                    console.error("결제 정보 저장 실패:", error);
                    alert(
                        "결제 정보 저장에 실패했습니다: " +
                        (error.response?.data?.message || error.message)
                    );
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
