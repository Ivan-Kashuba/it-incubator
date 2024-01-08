export type ExpressErrorType = {
  status: 400;
  text: string;
  method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
};
