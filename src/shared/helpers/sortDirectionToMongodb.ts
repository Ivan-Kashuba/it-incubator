import { TSortDirection } from '../types/Pagination';

export const sortDirectionToMongodb = (sortDirection: TSortDirection) => {
  if (sortDirection === 'asc') return 1;
  if (sortDirection === 'desc') return -1;

  return 1;
};
