import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { paymentMethodMap } from "../../util/paymentMethodMap";
import "../../styles/payment/PaymentHistoryTable.css";

const PaymentButtonCom = ({
                              paymentMethod = 'card',
                              onPaymentComplete,
                              bookingInfo,
                              totalAmount
                          }) => {
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    const handlePayment = async () => {
        console.log("결제 시작 - bookingInfo:", bookingInfo);
        console.log("결제 금액:", totalAmount);

        if (!bookingInfo) {
            alert("예약 정보가 없습니다.");
            return;
        }

        // 먼저 사용자 정보 가져오기
        let currentUser = null;
        try {
            const userResponse = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                withCredentials: true,
            });

            if (userResponse.data.success && userResponse.data.user) {
                currentUser = userResponse.data.user;
                console.log("현재 사용자 정보:", currentUser);
            } else {
                alert("사용자 정보를 가져올 수 없습니다. 로그인 상태를 확인해주세요.");
                return;
            }
        } catch (error) {
            console.error("사용자 정보 조회 실패:", error);
            alert("로그인이 필요합니다.");
            return;
        }

        if (!window.IMP) {
            alert("아임포트 모듈이 로드되지 않았습니다.");
            return;
        }

        const IMP = window.IMP;
        IMP.init(process.env.REACT_APP_IMP_KEY);

        console.log("아임포트 결제창 실행...");

        IMP.request_pay(
            {
                pg: "html5_inicis",
                pay_method: paymentMethod,
                merchant_uid: `hotel_${new Date().getTime()}`,
                name: `${bookingInfo.hotelName} - ${bookingInfo.nights}박`,
                amount: totalAmount,
                buyer_email: bookingInfo.guestEmail,
                buyer_name: bookingInfo.guestName,
                buyer_tel: bookingInfo.guestPhone,
            },
            async (rsp) => {
                console.log("결제 결과:", rsp);

                if (!rsp.success) {
                    console.error("아임포트 결제 실패:", rsp);
                    alert("결제가 실패했습니다: " + (rsp.error_msg || "알 수 없는 오류"));
                    return;
                }

                // 결제 성공 시 백엔드로 데이터 전송
                const paymentWithReservationData = {
                    payment: {
                        userId: currentUser.userId, // ✅ 사용자 ID 추가!
                        impUid: rsp.imp_uid,
                        merchantUid: rsp.merchant_uid,
                        paymentMethodId: paymentMethodMap[paymentMethod] || 1,
                        totalPrice: totalAmount,
                        paymentDate: new Date().toISOString(),
                    },
                    reservation: {
                        // 숙소 정보
                        hotelName: bookingInfo.hotelName,
                        hotelLocation: bookingInfo.hotelLocation,
                        hotelCategory: bookingInfo.hotelCategory || '호텔',
                        roomType: bookingInfo.roomType || '스탠다드',

                        // 예약 기간
                        checkInDate: bookingInfo.checkInDate,
                        checkOutDate: bookingInfo.checkOutDate,
                        nights: bookingInfo.nights,
                        adults: bookingInfo.adults,

                        // 가격 정보
                        pricePerNight: bookingInfo.pricePerNight,
                        totalPrice: totalAmount,
                        currency: 'KRW',

                        // 예약자 정보
                        guestName: bookingInfo.guestName,
                        guestPhone: bookingInfo.guestPhone,
                        guestEmail: bookingInfo.guestEmail,
                        specialRequests: bookingInfo.specialRequests,

                        // 여행 패키지 정보
                        packageId: bookingInfo.packageId,
                        packageTitle: bookingInfo.packageTitle
                    }
                };

                console.log("📦 호텔 예약 데이터 백엔드로 전송:", paymentWithReservationData);

                try {
                    // JWT 토큰이 쿠키로 자동 전송됨
                    const response = await axios.post(`${API_BASE_URL}/api/payments/with-reservation`,
                        paymentWithReservationData,
                        { withCredentials: true }
                    );

                    console.log("호텔 예약 및 결제 저장 성공:", response.data);

                    alert(`✅ ${bookingInfo.hotelName} 예약 및 결제가 완료되었습니다!`);
                    onPaymentComplete?.();

                    // 결제 완료 후 결제 내역 새로고침
                    if (window.addNewPayment) {
                        setTimeout(() => {
                            window.addNewPayment();
                        }, 500); // 0.5초 후 새로고침 (DB 저장 완료 대기)
                    }

                    navigate("/mypage/payments", {
                        state: {
                            message: `${bookingInfo.hotelName} 예약이 완료되었습니다!`,
                            bookingDetails: bookingInfo
                        }
                    });
                } catch (error) {
                    console.error("호텔 예약 정보 저장 실패:", error);
                    alert("예약 저장 실패: " + (error.response?.data?.message || error.message));
                }
            }
        );
    };

    return (
        <button onClick={handlePayment} className="payment-button hotel-payment-button">
            🏨 {totalAmount.toLocaleString()}원 결제하기
        </button>
    );
};

export default PaymentButtonCom;