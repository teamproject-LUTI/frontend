import { useNavigate } from "react-router-dom";
import { savePayment } from "../../services/PaymentService";

const PaymentButtonCom = ({
                              hotelInfo,
                              roomType,
                              checkInDate,
                              checkOutDate,
                              guestCount,
                              userInfo,
                              paymentMethod,
                              onPaymentComplete,
                          }) => {
    const navigate = useNavigate();

    // 숙박일 수 계산
    const calculateNights = () => {
        const inDate = new Date(checkInDate);
        const outDate = new Date(checkOutDate);
        const diff = (outDate - inDate) / (1000 * 60 * 60 * 24);
        return Math.max(diff, 1);
    };

    const nights = calculateNights();
    const totalAmount = nights * hotelInfo.pricePerNight;

    const handlePayment = () => {
        if (!window.IMP) return alert("결제 모듈이 로드되지 않았습니다.");
        const IMP = window.IMP;
        IMP.init(process.env.REACT_APP_IMP_KEY);

        IMP.request_pay(
            {
                pg: "html5_inicis.INIpayTest",
                pay_method: "card",
                merchant_uid: `order_${Date.now()}`,
                name: `${hotelInfo.name} 예약`,
                amount: totalAmount,
                buyer_name: userInfo.name,
                buyer_tel: userInfo.phone,
                buyer_email: userInfo.email,
            },
            async (rsp) => {
                if (rsp.success) {
                    const paymentData = {
                        user: {
                            name: userInfo.name,
                            phone: userInfo.phone,
                            email: userInfo.email,
                        },
                        reservation: {
                            hotelId: hotelInfo.id,
                            hotelName: hotelInfo.name,
                            roomType,
                            checkInDate,
                            checkOutDate,
                            guestCount,
                        },
                        payment: {
                            amount: totalAmount,
                            method: paymentMethod,
                            impUid: rsp.imp_uid,
                            merchantUid: rsp.merchant_uid,
                        },
                    };
                    try {
                        await savePayment(paymentData);
                        onPaymentComplete?.();
                        navigate("/reservation/success", { replace: true });
                    } catch (e) {
                        alert("결제 성공, 서버 저장 실패");
                        navigate("/reservation/fail", { replace: true });
                    }
                } else {
                    alert(rsp.error_msg || "결제 실패");
                }
            }
        );
    };

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <h2>{hotelInfo.name}</h2>
            <p>
                🛏️ 객실 타입: <strong>{roomType}</strong>
            </p>
            <p>
                📅 체크인: <strong>{checkInDate}</strong> ~ 체크아웃: <strong>{checkOutDate}</strong>
            </p>
            <p>
                🕒 숙박일수: <strong>{nights}박</strong>
            </p>
            <p>
                👤 인원: <strong>{guestCount}명</strong>
            </p>

            <h3 style={{ marginTop: "2rem" }}>
                💰 총 금액: {totalAmount.toLocaleString()}원
            </h3>

            <button onClick={handlePayment} style={{ marginTop: "1rem" }}>
                예약 결제하기
            </button>
        </div>
    );

};

export default PaymentButtonCom;
