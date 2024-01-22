import { agent, Response } from 'supertest';
import { app } from '../../src/app';
import { allowedBasicHeader } from '../../src/middlewares/adminAuthCheckMiddleware';

export const getRequest = () => {
  return agent(app).set('Authorization', allowedBasicHeader);
};

export type SuperTestBodyResponse<T> = Omit<Response, 'body'> & { body: T };
