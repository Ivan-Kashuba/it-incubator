import express, { Request, Response } from 'express';

import { jwtService } from '../application/jwtService';
import { securityQueryRepository } from '../repositories/security-query-repository';
import { RequestWithParams, STATUS_HTTP } from '../shared/types/index';
import { authService } from '../domain/auth/services/auth-service';
import { ResultService } from '../shared/helpers/resultObject';

export const securityRouter = express.Router();

securityRouter.get('/devices', async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const user = await jwtService.getUserInfoByToken(refreshTokenFromCookie);

  if (!user) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const userSessions = await securityQueryRepository.getUserSessionsListById(user.userId);

  if (userSessions) {
    res.status(STATUS_HTTP.OK_200).send(userSessions);
    return;
  }

  res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
});

securityRouter.delete('/devices', async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  if (!refreshTokenFromCookie) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const user = await jwtService.getUserInfoByToken(refreshTokenFromCookie);

  if (!user) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const currentSession = await authService.getUserSessionByIdAndRefreshToken(user?.userId, refreshTokenFromCookie);
  if (!currentSession) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const isDeleted = await authService.removeAllButCurrentUserSession(user.userId, currentSession?._id);

  if (isDeleted) {
    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    return;
  }

  res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
});

securityRouter.delete('/devices/:deviceId', async (req: RequestWithParams<{ deviceId: string }>, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;
  const deviceId = req.params.deviceId;

  if (!refreshTokenFromCookie) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const user = await jwtService.getUserInfoByToken(refreshTokenFromCookie);

  if (!user) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const currentSession = await authService.getUserSessionByIdAndRefreshToken(user?.userId, refreshTokenFromCookie);

  if (!currentSession) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const deleteResult = await authService.removeSessionByDeviceAndUsersIds(deviceId, user.userId);
  const httpDeleteResult = ResultService.mapResultToHttpResponse(deleteResult);

  res.status(httpDeleteResult.statusCode).send(httpDeleteResult.body);
});
