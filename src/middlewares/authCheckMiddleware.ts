import { NextFunction, Request, Response } from 'express';
import { STATUS_HTTP } from '../shared/types';

export const allowedHeader = 'Basic YWRtaW46cXdlcnR5';
export const authCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (allowedHeader === authHeader) {
    next();
  } else {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
  }
};
