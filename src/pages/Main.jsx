import React from 'react';
import Layout from '../components/layout/Layout';
import { Search } from "lucide-react";
import Swal from 'sweetalert2';

const Main = () => {


    return (
        <Layout>
            {/* Search Bar */}
            <div className="main-search-section">
                <form  className="main-search-container">
                    {/*onSubmit={handleSearch}*/}
                    <Search className="main-search-icon" />
                    <input
                        type="text"
                        placeholder="여행지, 숙소, 액티비티 검색..."
                        className="main-search-input"
                        // value={keyword}
                        // onChange={(e) => setKeyword(e.target.value)}
                    />
                </form>
            </div>
                <div className="button-section">
                    <button className="floating-button" onClick={() => {
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
                                input: 'luti-input',
                                confirmButton: 'luti-btn',
                            }
                        });
                    }}>
                        인풋알럿 띄우기
                    </button>

                    <button
                        className="floating-button"
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
                                    Swal.fire({
                                        title: '삭제 완료!',
                                        text: '파일이 삭제되었어요.',
                                        icon: 'success',
                                        confirmButtonColor: '#F76B59',
                                    });
                                }
                            });
                        }}
                    >
                        삭제 확인 알럿 띄우기
                    </button>
                </div>


        </Layout>
    );
};

export default Main;