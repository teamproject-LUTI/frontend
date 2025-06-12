import PaymentButtonCom from "../components/payment/PaymentButtonCom";

const PaymentTestPage = () => {
    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h2>🧪 결제 테스트 페이지</h2>
            <PaymentButtonCom
                hotelInfo={{ id: 1, name: "테스트호텔", pricePerNight: 101 }}
                roomType="디럭스"
                checkInDate="2025-06-20"
                checkOutDate="2025-06-21"
                guestCount={1}
                userInfo={{
                    name: "홍길동",
                    phone: "01012345678",
                    email: "hong@test.com",
                }}
                paymentMethod="card"
                onPaymentComplete={() => console.log("✅ 결제 완료")}
            />
        </div>
    );
};

export default PaymentTestPage;
