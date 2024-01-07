import { agent, Response } from 'supertest';
import { app } from '../../src/app';
import { allowedHeader } from '../../src/middlewares/authCheckMiddleware';

export const getRequest = () => {
  return agent(app).set('Authorization', allowedHeader);
};

export type SuperTestBodyResponse<T> = Omit<Response, 'body'> & { body: T };
