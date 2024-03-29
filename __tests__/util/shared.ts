import { agent, Response } from 'supertest';
import { app } from '../../src/app';
import { allowedBasicHeader } from '../../src/middlewares/adminAuthCheckMiddleware';

export const getAdminAllowedRequest = () => {
  return agent(app).set('Authorization', allowedBasicHeader);
};

export const getUserAuthorisedRequest = (token: string, refreshToken?: string) => {
  return agent(app).set('Authorization', `Bearer ${token}`).set('Cookie', `refreshToken=${refreshToken}`);
};

export const getRequest = () => {
  return agent(app);
};

export type SuperTestBodyResponse<T> = Omit<Response, 'body'> & { body: T };

export function getExpectState<T>() {
  return expect.getState.bind(expect) as () => unknown as () => T;
}
