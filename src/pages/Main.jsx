import React, { useState } from 'react';
import Topbar from '../components/layout/Topbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import '../styles/Main.css';
import Swal from 'sweetalert2';
import ChatForm from "../components/chatgpt/ChatForm";

const Main = ({ children }) => {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const handleClosePopup = () => setIsPopupOpen(false);


    //팝업에 넘길 action 버튼들
    const popupActions = (
        <div className="popup-buttons">
            <button className="cancel" onClick={handleClosePopup}>닫기</button>
            <button className="confirm" onClick={() => {
                console.log("확인 눌렀음!");
                handleClosePopup();
            }}>확인</button>
        </div>
    );

    return (
        <div className="main-layout">
            <Topbar />
            <div className="main-content-wrapper">
                <Sidebar />
                <main className="main-content">
                    {/* GPT 여행 검색창 삽입 */}
                    <ChatForm />
                    {children}
                    <div>
                        {/*<button onClick={() => setModalOpen()}>루티 모달 열기</button>*/}
                        <button onClick={() => {
                            Swal.fire({
                                title: '여정 이름을 입력하세요',
                                input: 'text',
                                inputPlaceholder: '예: 유럽 자유여행 ✈️',
                                showCancelButton: true,
                                confirmButtonText: '저장',
                                cancelButtonText: '취소',
                                confirmButtonColor: '#F76B59',
                                cancelButtonColor: '#d3d3d3',
                                customClass: {
                                    input: 'luti-input',         // 👈 인풋박스 스타일 지정
                                    confirmButton: 'luti-btn',   // 버튼도 같이 예쁘게
                                }
                            });
                        }}>
                            인풋알럿 띄우기
                        </button>

                        <button
                            onClick={() => {
                                Swal.fire({
                                    title: '정말 삭제할까요?',
                                    text: '삭제하면 되돌릴 수 없어요!',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#F76B59',
                                    cancelButtonColor: '#d3d3d3',
                                    confirmButtonText: '삭제',
                                    cancelButtonText: '취소',
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        Swal.fire(
                                            {
                                                title:'삭제 완료!',
                                                text:'파일이 삭제되었어요.',
                                                icon:'success',
                                                confirmButtonColor: '#F76B59',
                                            }
                                        );
                                    }
                                });
                            }}
                        >
                            삭제 확인 알럿 띄우기
                        </button>

                    </div>
                </main>
            </div>
            <Footer />

        </div>
    );
};

export default Main;
