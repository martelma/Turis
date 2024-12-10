export interface PaginatedList<T> {
    items?: T[];
    pageIndex: number;
    pageSize: number;
    totalCount: number;
    hasNextPage: boolean;
}

export interface Pagination {
    length?: number;
    pageSize?: number;
    pageIndex?: number;
}

export class BaseSearchParameters {
    pattern?: string;
    pageIndex?: number;
    pageSize?: number;
    orderBy?: string;
}

export const defaultPaginatedList = {
    items: [],
    pageIndex: 0,
    pageSize: 10,
    totalCount: 0,
    hasNextPage: false,
};

export const emptyGuid = '00000000-0000-0000-0000-000000000000';
