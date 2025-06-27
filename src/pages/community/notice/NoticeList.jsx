// src/pages/community/notice/NoticeList.jsx

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../../styles/community/notice/NoticeList.css';

const NoticeList = () => {
    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(1);
    const size = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 검색창 - 입력 중 상태
    const [inputSearchType, setInputSearchType] = useState('title');
    const [inputKeyword, setInputKeyword] = useState('');
    // 검색창 - 실제 검색에 사용될 상태
    const [searchType, setSearchType] = useState('title');
    const [keyword, setKeyword] = useState('');
    const selectRef = useRef(null);

    const navigate = useNavigate();

    // 사용자 정보 조회
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await axios.get('/api/auth/me');
                if (res.data.success) {
                    setUserInfo(res.data.user);
                }
            } catch (err) {
                console.error('사용자 정보 조회 실패:', err);
                setUserInfo(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserInfo();
    }, []);

    // 공지사항 목록 조회 (페이지, 검색어 변경 시마다 다시 호출)
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await axios.get('/api/notices', {
                    params: {
                        page,
                        size,
                        searchType,   // 실제 검색용 상태
                        keyword       // handleSearch 시점에만 바뀜
                    }
                });
                // API returns MultiResponseDto<NoticeResponseDto>
                setNotices(res.data.data || []);
                setTotalPages(res.data.pageInfo?.totalPages || 1);
            } catch (err) {
                console.error('공지사항 목록 조회 실패:', err);
            }
        };
        fetchNotices();
    }, [page, searchType, keyword]);

    // 검색 버튼 클릭 핸들러: 페이지를 1로 초기화
    const handleSearch = () => {
        setPage(1);
        // useEffect에서 searchType, keyword가 바뀌면 자동으로 재호출 됩니다.
        setSearchType(inputSearchType);
        setKeyword(inputKeyword);
    };

    // 관리자 여부 확인 (userTypeId가 2인 경우)
    const isAdmin = userInfo?.userTypeId === 2;

    // 로딩 중일 때는 로딩 표시
    if (isLoading) {
        return (
            <div className="communtiy-main-layout">
                <div className="community-main-content-wrapper">
                    <main className="communtiy-main-content">
                        <div>로딩 중...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="community-main-layout">
            <div className="communtiy-main-content-wrapper">
                <main className="notice-main-content">
                    <div className="notice-header">
                        <h1>공지사항</h1>

                        {/* 검색 컨트롤: 글쓰기 버튼 왼쪽 배치 */}
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

                        {/* 관리자일 때만 글쓰기 버튼 표시 */}
                        {isAdmin && (
                            <button
                                type="button"
                                className="write-button"
                                onClick={() => navigate('/community/notice/write')}
                            >
                                글쓰기
                            </button>
                        )}
                    </div>

                    <table className="notice-table">
                        <thead>
                        <tr>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>작성일</th>
                            <th>조회수</th>
                        </tr>
                        </thead>
                        <tbody>
                        {notices.map((n) => (
                            <tr
                                key={n.noticeId}
                                onClick={() => navigate(`/community/notice/${n.noticeId}`)}
                                className="notice-row"
                            >
                                <td>{n.noticeId}</td>
                                <td className="notice-title">{n.title}</td>
                                <td>{n.userName}</td>
                                <td>{n.createdAt.substring(0, 10)}</td>
                                <td>{n.viewCount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* 목록이 비어있을 때 */}
                    {notices.length === 0 && (
                        <div className="notice-empty">
                            <p>
                                {keyword ?
                                    `"${keyword}" 검색 결과가 없습니다.` :
                                    '등록된 공지사항이 없습니다.'
                                }
                            </p>
                        </div>
                    )}

                    <div className="pagination">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
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
                            onClick={() => setPage(page + 1)}
                        >
                            &gt;
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NoticeList;