import request, { Response } from 'supertest';
import { app } from '../../src/app';

export const getRequest = () => {
  return request(app);
};

export type SuperTestBodyResponse<T> = Omit<Response, 'body'> & { body: T };
