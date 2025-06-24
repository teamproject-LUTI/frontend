import React from 'react';
import '../../styles/common/Pagination.css';

const Pagination = ({
                        currentPage,    // 백엔드에서 받은 0-based 페이지 (Controller와 일치)
                        totalPages,
                        totalElements,
                        pageSize,
                        onPageChange,   // 0-based 페이지를 전달하는 함수
                        showInfo = true,
                        maxVisiblePages = 5
                    }) => {

    // 페이지 번호 배열 생성 (표시할 페이지들) - 0-based로 계산
    const getVisiblePages = () => {
        if (totalPages <= maxVisiblePages) {
            // 총 페이지가 최대 표시 페이지보다 적으면 모든 페이지 표시
            return Array.from({ length: totalPages }, (_, i) => i);
        }

        const half = Math.floor(maxVisiblePages / 2);
        let start = Math.max(0, currentPage - half);
        let end = Math.min(totalPages - 1, start + maxVisiblePages - 1);

        // 끝 부분에 도달했을 때 시작점 조정
        if (end - start < maxVisiblePages - 1) {
            start = Math.max(0, end - maxVisiblePages + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();
    const startItem = (currentPage * pageSize) + 1;
    const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

    // 페이지 변경 가능 여부 체크 함수
    const canChangePage = (page) => {
        return page >= 0 && page < totalPages && page !== currentPage;
    };


    return (
        <div className="pagination-container">

            <div className="pagination">
                {/* 첫 페이지 버튼 */}
                <button
                    className="pagination-btn pagination-first"
                    disabled={currentPage === 0}
                    onClick={() => canChangePage(0) && onPageChange(0)}
                    title="첫 페이지"
                >
                    &laquo;
                </button>

                {/* 이전 페이지 버튼 */}
                <button
                    className="pagination-btn pagination-prev"
                    disabled={currentPage === 0}
                    onClick={() => canChangePage(currentPage - 1) && onPageChange(currentPage - 1)}
                    title="이전 페이지"
                >
                    &lsaquo;
                </button>

                {/* 시작 부분에 생략 표시 */}
                {visiblePages[0] > 0 && (
                    <>
                        <button
                            className="pagination-btn"
                            onClick={() => canChangePage(0) && onPageChange(0)}
                        >
                            1
                        </button>
                        {visiblePages[0] > 1 && (
                            <span className="pagination-ellipsis">...</span>
                        )}
                    </>
                )}

                {/* 페이지 번호 버튼들 */}
                {visiblePages.map(page => (
                    <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => canChangePage(page) && onPageChange(page)}
                    >
                        {page + 1}
                    </button>
                ))}

                {/* 끝 부분에 생략 표시 */}
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                    <>
                        {visiblePages[visiblePages.length - 1] < totalPages - 2 && (
                            <span className="pagination-ellipsis">...</span>
                        )}
                        <button
                            className="pagination-btn"
                            onClick={() => canChangePage(totalPages - 1) && onPageChange(totalPages - 1)}
                        >
                            {totalPages}
                        </button>
                    </>
                )}

                {/* 다음 페이지 버튼 */}
                <button
                    className="pagination-btn pagination-next"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => canChangePage(currentPage + 1) && onPageChange(currentPage + 1)}
                    title="다음 페이지"
                >
                    &rsaquo;
                </button>

                {/* 마지막 페이지 버튼 */}
                <button
                    className="pagination-btn pagination-last"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => canChangePage(totalPages - 1) && onPageChange(totalPages - 1)}
                    title="마지막 페이지"
                >
                    &raquo;
                </button>
            </div>
        </div>
    );
};

export default Pagination;