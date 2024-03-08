import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../application/jwtService';

export const getUserInfoFromTokenWithoutAuthCheck = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.split(' ')[1];

  if (bearerToken) {
    const userInfo = await jwtService.getUserInfoByToken(bearerToken);
    if (userInfo?.userId) {
      req.user = userInfo;
    }
  }
  next();
};
