import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { 
    selectConversationsWithUnreadCounts, 
    selectTotalUnreadCount,
    selectMessagesByConversationId 
} from '@/store/slices/chatSlice';
import { selectIsAuthenticated, selectUserDisplayName } from '@/store/slices/userSlice';

export interface PaginationOptions {
    page: number;
    pageSize: number;
    total: number;
}

export interface UsePaginationReturn {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setPageSize: (size: number) => void;
    paginatedData: any[];
}

export function usePagination<T>(
    data: T[],
    options: Partial<PaginationOptions> = {}
): UsePaginationReturn {
    const {
        page: initialPage = 1,
        pageSize: initialPageSize = 10,
        total: initialTotal = data.length
    } = options;

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const totalItems = initialTotal || data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, pageSize]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const nextPage = () => {
        if (hasNextPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (hasPrevPage) {
            setCurrentPage(currentPage - 1);
        }
    };

    return {
        currentPage,
        pageSize,
        totalPages,
        totalItems,
        hasNextPage,
        hasPrevPage,
        goToPage,
        nextPage,
        prevPage,
        setPageSize,
        paginatedData
    };
}

// 使用优化 Redux selectors 的自定义 hooks
export function useOptimizedChatSelectors() {
    const conversations = useSelector(selectConversationsWithUnreadCounts);
    const totalUnreadCount = useSelector(selectTotalUnreadCount);
    
    return {
        conversations,
        totalUnreadCount,
        hasUnreadMessages: totalUnreadCount > 0
    };
}

export function useOptimizedUserSelectors() {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const displayName = useSelector(selectUserDisplayName);
    
    return {
        isAuthenticated,
        displayName
    };
}

export function useOptimizedMessages(conversationId: number) {
    const messages = useSelector((state: RootState) => 
        selectMessagesByConversationId(state, conversationId)
    );
    
    return {
        messages,
        messageCount: messages.length
    };
} 