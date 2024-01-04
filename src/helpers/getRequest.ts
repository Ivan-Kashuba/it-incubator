import request from 'supertest';
import { app } from '../app';

export const getRequest = () => {
  return request(app);
};
