import { NextFunction, Request, Response } from 'express';
import { STATUS_HTTP } from '../shared/types';

export const allowedBasicHeader = 'Basic YWRtaW46cXdlcnR5';
export const adminAuthCheckMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (allowedBasicHeader === authHeader) {
    next();
  } else {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
  }
};
