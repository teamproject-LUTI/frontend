import axios from "axios";

export const savePayment = async (paymentData) => {
    try {
        const response = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/pay`,
            paymentData
        );
        return response.data;
    } catch (error) {
        console.error("결제 정보 저장 실패:", error);
        throw error;
    }
};
