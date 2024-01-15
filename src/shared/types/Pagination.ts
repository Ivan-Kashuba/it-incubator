export type WithPagination<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

export type TSortDirection = 'asc' | 'desc';

export type PaginationPayload<T> = {
  pageNumber?: string;
  limit?: string;
  sortBy?: T;
  sortDirection?: TSortDirection;
};
