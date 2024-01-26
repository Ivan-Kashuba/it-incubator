import { agent, Response } from 'supertest';
import { app } from '../../src/app';
import { allowedBasicHeader } from '../../src/middlewares/adminAuthCheckMiddleware';

export const getAdminAllowedRequest = () => {
  return agent(app).set('Authorization', allowedBasicHeader);
};

export const getUserAuthorisedRequest = (token: string) => {
  return agent(app).set('Authorization', `Bearer ${token}`);
};

export const getRequest = () => {
  return agent(app);
};

export type SuperTestBodyResponse<T> = Omit<Response, 'body'> & { body: T };
