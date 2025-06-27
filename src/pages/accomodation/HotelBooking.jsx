import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, MapPin, Heart, CreditCard, ArrowLeft, Calculator } from 'lucide-react';
import axios from 'axios';
import '../../styles/accomodation/HotelBooking.css';
import PaymentButtonCom from '../../components/payment/PaymentButtonCom';
import Swal from 'sweetalert2';

const HotelBooking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // ❌ const [showPayment, setShowPayment] = useState(false); // 제거됨

    // 예약 정보 상태
    const [reservationInfo, setReservationInfo] = useState({
        checkInDate: '',
        checkOutDate: '',
        adults: 2,
        guestName: '',
        guestPhone: '',
        guestEmail: '',
        specialRequests: ''
    });

    const [nights, setNights] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [pricePerNight, setPricePerNight] = useState(0);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    useEffect(() => {
        // 이전 페이지에서 전달받은 선택된 루트 데이터
        const selectedRoute = location.state?.selectedRoute;
        const searchInfo = location.state?.searchInfo;

        if (!selectedRoute || !searchInfo) {
            setError('예약 정보가 없습니다. 다시 여행 계획을 선택해주세요.');
            return;
        }

        setBookingData({ selectedRoute, searchInfo });

        // 초기 예약 정보 설정
        setReservationInfo(prev => ({
            ...prev,
            checkInDate: searchInfo.checkInDate,
            checkOutDate: searchInfo.checkOutDate,
            adults: searchInfo.adults || 2
        }));

        // 가격 정보 추출
        if (selectedRoute.hotel?.pricePerNight) {
            const priceStr = selectedRoute.hotel.pricePerNight.replace(/[^\d]/g, '');
            setPricePerNight(parseInt(priceStr) || 0);
        }
    }, [location.state]);

    // 박수 및 총 가격 계산
    useEffect(() => {
        if (reservationInfo.checkInDate && reservationInfo.checkOutDate) {
            const checkIn = new Date(reservationInfo.checkInDate);
            const checkOut = new Date(reservationInfo.checkOutDate);
            const diffTime = Math.abs(checkOut - checkIn);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setNights(diffDays);
            setTotalPrice(diffDays * pricePerNight);
        }
    }, [reservationInfo.checkInDate, reservationInfo.checkOutDate, pricePerNight]);

    // ❌ showPayment 관련 useEffect 제거됨

    // 입력값 변경 핸들러
    const handleInputChange = (field, value) => {
        setReservationInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 즐겨찾기 저장
    const saveToFavorites = async () => {
        if (loading) return;

        setLoading(true);
        try {
            const saveData = {
                routeTitle: bookingData.selectedRoute.title,
                routeContent: {
                    searchInfo: bookingData.searchInfo,
                    selectedPackage: bookingData.selectedRoute,
                    savedAt: new Date().toISOString()
                }
            };

            const response = await axios.post(`${API_BASE_URL}/api/routes/save`, saveData, {
                withCredentials: true
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    text: '💖 즐겨찾기에 저장되었습니다!',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
            }
        } catch (error) {
            console.error('즐겨찾기 저장 실패:', error);

            // ✅ SweetAlert2로 변경 (에러 메시지)
            Swal.fire({
                icon: 'error',
                title: '저장 실패',
                text: '즐겨찾기 저장 중 오류가 발생했습니다.',
                confirmButtonText: '확인'
            });
        } finally {
            setLoading(false);
        }
    };

    // ✅ 검증 함수 (PaymentButtonCom에 전달할 함수)
    const validateBookingInfo = () => {
        // 필수 정보 검증
        if (!reservationInfo.guestName || !reservationInfo.guestPhone || !reservationInfo.guestEmail) {
            Swal.fire({
                icon: 'warning',
                title: '입력 정보 확인',
                text: '예약자 정보를 모두 입력해주세요.',
                confirmButtonText: '확인'
            });
            return false;
        }

        if (!reservationInfo.checkInDate || !reservationInfo.checkOutDate) {
            Swal.fire({
                icon: 'warning',
                title: '날짜 선택 필요',
                text: '숙박 날짜를 선택해주세요.',
                confirmButtonText: '확인'
            });
            return false;
        }

        if (nights <= 0) {
            Swal.fire({
                icon: 'warning',
                title: '날짜 확인',
                text: '올바른 숙박 기간을 선택해주세요.',
                confirmButtonText: '확인'
            });
            return false;
        }

        return true;
    };

    // 결제 완료 처리
    const handlePaymentComplete = () => {
        navigate('/mypage/payments');
    };

    if (error) {
        return (
            <div className="booking-container">
                <div className="error-section">
                    <p className="error-message">⚠️ {error}</p>
                    <button onClick={() => navigate(-1)} className="back-button">
                        <ArrowLeft size={16} />
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    if (!bookingData) {
        return (
            <div className="booking-container">
                <div className="loading-section">
                    <div className="loading-spinner"></div>
                    <p>예약 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    const { selectedRoute, searchInfo } = bookingData;

    // PaymentButtonCom에 전달할 예약 정보 구성
    const paymentBookingInfo = {
        hotelName: selectedRoute.hotel.name, //호텔 이름
        hotelLocation: selectedRoute.hotel.location, //호텔 위치
        hotelCategory: selectedRoute.hotel.category, //호텔 카테고리
        roomType: '스탠다드',
        checkInDate: reservationInfo.checkInDate, //체크인
        checkOutDate: reservationInfo.checkOutDate, //체크아웃
        nights: nights, //박 수
        adults: reservationInfo.adults, //성인 인원
        pricePerNight: pricePerNight, // 박 당 가격
        guestName: reservationInfo.guestName, // 예약자 이름
        guestPhone: reservationInfo.guestPhone, // 예약자 번호
        guestEmail: reservationInfo.guestEmail, // 예약자 이메일
        specialRequests: reservationInfo.specialRequests, // 별도 요청사항
        packageId: selectedRoute.packageId, // 루트 id
        packageTitle: selectedRoute.title, // 루트 제목
        selectedRoute: selectedRoute, // 전체 여행 계획 (여행 일정 포함)
        searchInfo: searchInfo // 검색 조건 정보
    };

    return (
        <div className="booking-container">
            {/* 헤더 */}
            <div className="booking-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeft size={20} />
                    돌아가기
                </button>
                <h1>🏨 숙소 예약</h1>
                <button
                    onClick={saveToFavorites}
                    className="favorite-button"
                    disabled={loading}
                >
                    <Heart size={16} />
                    즐겨찾기
                </button>
            </div>

            <div className="booking-content">
                {/* 숙소 정보 요약 */}
                <div className="hotel-summary-card">
                    <h2 className="hotel-name">{selectedRoute.hotel.name}</h2>
                    <div className="hotel-meta">
                        <span className="hotel-category">{selectedRoute.hotel.category}</span>
                        <span className="hotel-location">
                            <MapPin size={14} />
                            {selectedRoute.hotel.location}
                        </span>
                    </div>
                    <div className="price-info">
                        <span className="price-per-night">
                            {selectedRoute.hotel.pricePerNight}/박
                        </span>
                    </div>
                </div>

                {/* 예약 정보 입력 */}
                <div className="booking-form-card">
                    <h3>예약 정보</h3>

                    {/* 숙박 기간 */}
                    <div className="form-section">
                        <h4>숙박 기간</h4>
                        <div className="date-inputs">
                            <div className="date-input-group">
                                <label>체크인</label>
                                <input
                                    type="date"
                                    value={reservationInfo.checkInDate}
                                    onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="date-input-group">
                                <label>체크아웃</label>
                                <input
                                    type="date"
                                    value={reservationInfo.checkOutDate}
                                    onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                                    min={reservationInfo.checkInDate}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 투숙 인원 */}
                    <div className="form-section">
                        <h4>투숙 인원</h4>
                        <div className="guests-input">
                            <Users size={16} />
                            <select
                                value={reservationInfo.adults}
                                onChange={(e) => handleInputChange('adults', parseInt(e.target.value))}
                            >
                                {[1,2,3,4,5,6,7,8].map(num => (
                                    <option key={num} value={num}>성인 {num}명</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 예약자 정보 */}
                    <div className="form-section">
                        <h4>예약자 정보</h4>
                        <div className="guest-inputs">
                            <input
                                type="text"
                                placeholder="예약자 이름 *"
                                value={reservationInfo.guestName}
                                onChange={(e) => handleInputChange('guestName', e.target.value)}
                                required
                            />
                            <input
                                type="tel"
                                placeholder="휴대폰 번호 *"
                                value={reservationInfo.guestPhone}
                                onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="이메일 주소 *"
                                value={reservationInfo.guestEmail}
                                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="특별 요청사항 (선택사항)"
                                value={reservationInfo.specialRequests}
                                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* 가격 요약 */}
                <div className="price-summary-card">
                    <h3>
                        <Calculator size={16} />
                        가격 요약
                    </h3>
                    <div className="price-breakdown">
                        <div className="price-row">
                            <span>숙박 기간</span>
                            <span>{nights}박</span>
                        </div>
                        <div className="price-row">
                            <span>1박 요금</span>
                            <span>{pricePerNight.toLocaleString()}원</span>
                        </div>
                        <div className="price-row total">
                            <span>총 결제 금액</span>
                            <span className="total-amount">{totalPrice.toLocaleString()}원</span>
                        </div>
                    </div>
                </div>

                {/* ✅ 수정된 결제 버튼 - 바로 PaymentButtonCom 렌더링 */}
                <div className="booking-actions">
                    <PaymentButtonCom
                        paymentMethod="card"
                        onPaymentComplete={handlePaymentComplete}
                        bookingInfo={paymentBookingInfo}
                        totalAmount={totalPrice}
                        validateBeforePayment={validateBookingInfo}
                    />
                </div>
            </div>
        </div>
    );
};

export default HotelBooking;