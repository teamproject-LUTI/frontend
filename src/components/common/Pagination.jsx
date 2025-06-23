// components/common/Pagination.jsx
import React from 'react';
import '../../styles/common/Pagination.css';

const Pagination = ({
                        currentPage,
                        totalPages,
                        totalElements,
                        pageSize,
                        onPageChange,
                        showInfo = true,
                        maxVisiblePages = 5
                    }) => {
    // 페이지 번호 배열 생성 (표시할 페이지들)
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

    // 페이지 변경 핸들러
    const handlePageChange = (page) => {
        if (page >= 0 && page < totalPages && page !== currentPage) {
            onPageChange(page);
        }
    };

    // 디버깅용 로그
    console.log('Pagination 렌더링:', {
        currentPage,
        totalPages,
        totalElements,
        pageSize,
        visiblePages
    });

    // 데이터가 없거나 총 페이지가 0 이하일 때는 페이지네이션을 표시하지 않음
    // 단, totalPages가 1인 경우에는 표시 (사용자가 페이지 정보를 볼 수 있도록)
    if (totalElements === 0 || totalPages === 0) {
        return null;
    }

    return (
        <div className="pagination-container">

                <div className="pagination">
                    {/* 첫 페이지 버튼 */}
                    <button
                        className="pagination-btn pagination-first"
                        disabled={currentPage === 0}
                        onClick={() => handlePageChange(0)}
                        title="첫 페이지"
                    >
                        &laquo;
                    </button>

                    {/* 이전 페이지 버튼 */}
                    <button
                        className="pagination-btn pagination-prev"
                        disabled={currentPage === 0}
                        onClick={() => handlePageChange(currentPage - 1)}
                        title="이전 페이지"
                    >
                        &lsaquo;
                    </button>

                    {/* 시작 부분에 생략 표시 */}
                    {visiblePages[0] > 0 && (
                        <>
                            <button
                                className="pagination-btn"
                                onClick={() => handlePageChange(0)}
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
                            onClick={() => handlePageChange(page)}
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
                                onClick={() => handlePageChange(totalPages - 1)}
                            >
                                {totalPages}
                            </button>
                        </>
                    )}

                    {/* 다음 페이지 버튼 */}
                    <button
                        className="pagination-btn pagination-next"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => handlePageChange(currentPage + 1)}
                        title="다음 페이지"
                    >
                        &rsaquo;
                    </button>

                    {/* 마지막 페이지 버튼 */}
                    <button
                        className="pagination-btn pagination-last"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => handlePageChange(totalPages - 1)}
                        title="마지막 페이지"
                    >
                        &raquo;
                    </button>
                </div>
        </div>
    );
};

export default Pagination;