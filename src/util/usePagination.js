import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * 간단한 페이지네이션 관리 커스텀 훅
 * @param {Function} fetchDataFn - 데이터를 가져오는 함수
 * @param {Object} options - 옵션 설정
 */
const usePagination = (fetchDataFn, options = {}) => {
    const {
        initialPageSize = 10,
        debounceDelay = 300
    } = options;

    // ref로 최신 상태 참조
    const latestStateRef = useRef({
        appliedSearch: '',
        appliedFilters: {}
    });

    // 페이지네이션 상태
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: initialPageSize
    });

    // 로딩 상태
    const [loading, setLoading] = useState(false);

    // 검색/필터 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});

    // 실제 적용된 검색/필터 상태
    const [appliedSearch, setAppliedSearch] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({});

    // 초기화 상태
    const [isInitialized, setIsInitialized] = useState(false);

    // 최신 상태 업데이트
    useEffect(() => {
        latestStateRef.current = { appliedSearch, appliedFilters };
    }, [appliedSearch, appliedFilters]);

    /**
     * 데이터 로드 함수 - useCallback으로 메모이제이션
     */
    const loadData = useCallback(async (page = 0, pageSize = initialPageSize, searchTerm = '', filters = {}) => {
        try {
            setLoading(true);
            const result = await fetchDataFn({
                page,
                pageSize,
                searchTerm,
                filters
            });

            // 백엔드 응답에 따라 페이지 정보 설정
            const pageInfo = result.pageInfo || {};

            // 백엔드가 1-based로 응답하는 경우 0-based로 변환
            const backendPage = pageInfo.page || (page + 1); // 1-based
            const frontendPage = Math.max(0, backendPage - 1); // 0-based로 변환

            setPagination({
                currentPage: frontendPage,
                totalPages: pageInfo.totalPages || 0,
                totalElements: pageInfo.totalElements || 0,
                pageSize: pageInfo.size || pageSize
            });

            return result;

        } catch (error) {
            console.error('데이터 로드 실패:', error);
            setPagination(prev => ({
                ...prev,
                currentPage: 0,
                totalPages: 0,
                totalElements: 0
            }));
            throw error;
        } finally {
            setLoading(false);
        }
    }, [fetchDataFn, initialPageSize]);

    /**
     * 페이지 변경 함수 - useCallback으로 메모이제이션
     */
    const changePage = useCallback((newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages && newPage !== pagination.currentPage) {
            const { appliedSearch, appliedFilters } = latestStateRef.current;
            loadData(newPage, pagination.pageSize, appliedSearch, appliedFilters);
        }
    }, [pagination.totalPages, pagination.currentPage, pagination.pageSize, loadData]);

    /**
     * 즉시 검색 함수
     */
    const search = useCallback(() => {
        setAppliedSearch(searchTerm);
        setAppliedFilters(filters);
        loadData(0, pagination.pageSize, searchTerm, filters);
    }, [searchTerm, filters, pagination.pageSize, loadData]);

    /**
     * 필터 초기화 함수
     */
    const reset = useCallback(() => {
        setSearchTerm('');
        setFilters({});
        setAppliedSearch('');
        setAppliedFilters({});
        loadData(0, pagination.pageSize, '', {});
    }, [pagination.pageSize, loadData]);

    /**
     * 새로고침 함수
     */
    const refresh = useCallback(() => {
        const { appliedSearch, appliedFilters } = latestStateRef.current;
        loadData(pagination.currentPage, pagination.pageSize, appliedSearch, appliedFilters);
    }, [pagination.currentPage, pagination.pageSize, loadData]);

    /**
     * 검색어 설정 함수
     */
    const setSearch = useCallback((value) => {
        setSearchTerm(value);
    }, []);

    /**
     * 필터 설정 함수
     */
    const setFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    /**
     * 여러 필터 설정 함수
     */
    const setFiltersFunc = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    /**
     * 검색/필터 디바운스 처리
     */
    useEffect(() => {
        // 초기화되지 않았으면 실행하지 않음
        if (!isInitialized) return;

        const timeoutId = setTimeout(() => {
            const searchChanged = appliedSearch !== searchTerm;
            const filtersChanged = JSON.stringify(appliedFilters) !== JSON.stringify(filters);

            if (searchChanged || filtersChanged) {
                setAppliedSearch(searchTerm);
                setAppliedFilters(filters);
                loadData(0, pagination.pageSize, searchTerm, filters);
            }
        }, debounceDelay);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters, appliedSearch, appliedFilters, isInitialized, pagination.pageSize, debounceDelay, loadData]);

    // 초기 데이터 로드 (한 번만)
    useEffect(() => {
        if (!isInitialized) {
            setIsInitialized(true);
            loadData(0, initialPageSize, '', {});
        }
    }, [isInitialized, loadData, initialPageSize]);

    // 필터가 적용되었는지 확인
    const hasFilters = appliedSearch || Object.keys(appliedFilters).some(key =>
        appliedFilters[key] && appliedFilters[key] !== 'all'
    );

    // actions 객체를 별도 변수로 생성하여 참조 안정성 확보
    const actions = {
        changePage,
        search,
        reset,
        refresh,
        setSearch,
        setFilter,
        setFilters: setFiltersFunc
    };

    return {
        // 상태
        pagination,
        loading,
        searchTerm,
        filters,

        // 액션들
        actions,

        // 유틸리티
        hasFilters
    };
};

export default usePagination;