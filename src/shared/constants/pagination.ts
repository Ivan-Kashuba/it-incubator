import { PaginationPayload } from '../types/Pagination';
import { SortDirection } from '../types/Sort';

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGINATION_PAYLOAD: PaginationPayload<any> = {
  pageSize: DEFAULT_PAGE_SIZE,
  sortDirection: DEFAULT_SORT_DIRECTION,
  pageNumber: DEFAULT_PAGE_NUMBER,
  sortBy: '',
};
