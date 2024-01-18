import { PaginationPayload, WithPagination } from '../types/Pagination';
import { SortDirection } from '../types/Sort';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DEFAULT_PAGINATION_PAYLOAD } from '../constants/pagination';

export function createPaginationResponse<T>(
  pagination: PaginationPayload<T>,
  items: T[],
  totalCount: number
): WithPagination<T> {
  const { pageSize, pageNumber } = pagination;

  const pagesCount = Math.ceil(totalCount / pageSize);

  return { pageSize, page: pageNumber, pagesCount, totalCount, items };
}

export const getSkip = (pageNumber: number, pageSize: number) => {
  return (pageNumber - 1) * pageSize;
};

export const getSortValue = (sortValue: SortDirection) => {
  if (sortValue === 'asc') {
    return 1;
  } else {
    return -1;
  }
};
export function validatePayloadPagination<T = { createdAt: string }>(
  paginationFromRequest: Partial<PaginationPayload<T>>,
  defaultSortBy: keyof T
) {
  const { sortDirection, sortBy, pageSize, pageNumber } = paginationFromRequest;

  return {
    pageSize: !isNaN(pageSize!) ? +pageSize! : DEFAULT_PAGINATION_PAYLOAD.pageSize,
    pageNumber: !isNaN(pageNumber!) ? +pageNumber! : DEFAULT_PAGINATION_PAYLOAD.pageNumber,
    sortBy: sortBy ? sortBy : defaultSortBy,
    sortDirection:
      sortDirection === 'asc' || sortDirection === 'desc' ? sortDirection : DEFAULT_PAGINATION_PAYLOAD.sortDirection,
  };
}
