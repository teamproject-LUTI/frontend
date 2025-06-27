// src/pages/community/qna/QnaList.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/community/qna/QnaList.css';

const QnaList = () => {
    const [asks, setAsks] = useState([]);
    const [page, setPage] = useState(1);
    const size = 10; // 한 페이지당 항목 수
    const [totalPages, setTotalPages] = useState(1);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // 새로고침 트리거

    // 검색창 - 입력 중 상태
    const [inputSearchType, setInputSearchType] = useState('title');
    const [inputKeyword, setInputKeyword] = useState('');
    // 검색창 - 실제 검색에 사용될 상태
    const [searchType, setSearchType] = useState('title');
    const [keyword, setKeyword] = useState('');
    const selectRef = useRef(null);

    const navigate = useNavigate();

    // 문의글 목록을 가져오는 함수
    const fetchAsks = useCallback(async () => {
        try {
            const res = await axios.get('/api/asks', {
                params: {
                    page,
                    size,
                    searchType,   // 실제 검색용 상태
                    keyword       // handleSearch 시점에만 바뀜
                }
            });
            // 응답 예시: { data: [ {...}, ... ], pageInfo: { totalPages: x, ... } }
            setAsks(res.data.data || []);
            setTotalPages(res.data.pageInfo?.totalPages || 1);
        } catch (err) {
            console.error('문의 목록 조회 실패', err);
        }
    }, [page, size, searchType, keyword]);

    // 페이지 변경 시 또는 새로고침 트리거 변경 시 목록 재조회
    useEffect(() => {
        fetchAsks();
    }, [fetchAsks, refreshTrigger]);

    // 페이지 이동 시 목록 새로고침 (브라우저 포커스 시)
    useEffect(() => {
        const handleFocus = () => {
            console.log('페이지 포커스 - 문의글 목록 새로고침');
            setRefreshTrigger(prev => prev + 1);
        };

        // 페이지가 다시 포커스될 때 목록 새로고침
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // 페이지 이동 시 목록 새로고침 (visibility 변경 시)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('페이지 가시성 변경 - 문의글 목록 새로고침');
                setRefreshTrigger(prev => prev + 1);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // 수동 새로고침 함수
    const handleRefresh = () => {
        console.log('수동 새로고침 실행');
        setRefreshTrigger(prev => prev + 1);
    };

    // 검색 버튼 클릭 핸들러: 페이지를 1로 초기화
    const handleSearch = () => {
        setPage(1);
        // useEffect에서 searchType, keyword가 바뀌면 자동으로 재호출 됩니다.
        setSearchType(inputSearchType);
        setKeyword(inputKeyword);
    };

    // 특정 문의글의 답변 상태를 업데이트하는 함수
    const updateAskAnswerStatus = useCallback((askId, answered) => {
        setAsks(prevAsks =>
            prevAsks.map(ask =>
                ask.askId === askId
                    ? { ...ask, answered }
                    : ask
            )
        );
    }, []);

    // 전역적으로 사용할 수 있도록 window 객체에 함수 등록
    useEffect(() => {
        window.updateQnaAnswerStatus = updateAskAnswerStatus;
        window.refreshQnaList = handleRefresh;

        return () => {
            delete window.updateQnaAnswerStatus;
            delete window.refreshQnaList;
        };
    }, [updateAskAnswerStatus]);

    return (
        <div className="community-main-layout">
            <div className="community-main-content-wrapper">
                <main className="community-main-content">
                    {/* 헤더 */}
                    <div className="qna-header">
                        <h1>문의 내역</h1>

                        {/* 검색 컨트롤: 질문하기 버튼 왼쪽 배치 */}
                        <div className="search-controls">
                            <div className="select-wrapper">
                                <select
                                    ref={selectRef}
                                    value={inputSearchType}
                                    onChange={e => setInputSearchType(e.target.value)}
                                >
                                    <option value="title">제목</option>
                                    <option value="author">작성자</option>
                                    <option value="content">내용</option>
                                </select>
                                <ChevronDown className="community-select-icon" size={16} />
                            </div>
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    placeholder="검색어를 입력하세요"
                                    value={inputKeyword}
                                    onChange={e => setInputKeyword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                />
                                <Search
                                    className="community-search-icon"
                                    size={18}
                                    onClick={handleSearch}
                                />
                            </div>
                        </div>

                        <div className="qna-header-actions">
                            <button
                                type="button"
                                className="ask-button"
                                onClick={() => navigate('/community/qna/write')}
                            >
                                질문하기
                            </button>
                        </div>
                    </div>

                    {/* 테이블 */}
                    <table className="qna-table">
                        <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>답변여부</th>
                        </tr>
                        </thead>
                        <tbody>
                        {asks.map((a) => (
                            <tr
                                key={a.askId}
                                onClick={() => navigate(`/community/qna/${a.askId}`)}
                                className="qna-row"
                            >
                                <td>{a.askId}</td>
                                <td className="title-cell">{a.title}</td>
                                <td>{a.userName}</td>
                                <td>{a.createdAt.substring(0, 10)}</td>
                                <td>
                                    <span
                                        className={`badge ${a.answered ? 'badge-success' : 'badge-pending'}`}
                                        key={`${a.askId}-${a.answered}`} // 상태 변경 시 리렌더링 강제
                                    >
                                        {a.answered ? '답변 완료' : '답변 대기'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 목록이 비어있을 때 */}
                    {asks.length === 0 && (
                        <div className="qna-empty">
                            <p>
                                {keyword ?
                                    `"${keyword}" 검색 결과가 없습니다.` :
                                    '등록된 문의가 없습니다.'
                                }
                            </p>
                        </div>
                    )}

                    {/* 페이지네이션 */}
                    <div className="pagination">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            &lt;
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={page === i + 1 ? 'active' : ''}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default QnaList;