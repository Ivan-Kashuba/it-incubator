import { Request, Response } from 'express';
import { RequestWithParams, STATUS_HTTP } from '../shared/types/index';
import { SecurityQueryRepository } from '../repositories/security-query-repository';
import { AuthService } from '../domain/auth/services/auth-service';
import { ResultService } from '../shared/helpers/resultObject';
import { injectable } from 'inversify';
import { JwtService } from '../application/jwtService';

@injectable()
export class SecurityController {
  constructor(
    protected jwtService: JwtService,
    protected authService: AuthService,
    protected securityQueryRepository: SecurityQueryRepository
  ) {}

  async getDevices(req: Request, res: Response) {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const user = await this.jwtService.getUserInfoByToken(refreshTokenFromCookie);

    if (!user) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const userSessions = await this.securityQueryRepository.getUserSessionsListById(user.userId);

    if (userSessions) {
      res.status(STATUS_HTTP.OK_200).send(userSessions);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async deleteAllButCurrentSessions(req: Request, res: Response) {
    const refreshTokenFromCookie = req.cookies.refreshToken;
    if (!refreshTokenFromCookie) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const user = await this.jwtService.getUserInfoByToken(refreshTokenFromCookie);

    if (!user) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const currentSession = await this.authService.getUserSessionByIdAndRefreshToken(
      user?.userId,
      refreshTokenFromCookie
    );
    if (!currentSession) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const isDeleted = await this.authService.removeAllButCurrentUserSession(user.userId, currentSession?._id);

    if (isDeleted) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async deleteSession(req: RequestWithParams<{ deviceId: string }>, res: Response) {
    const refreshTokenFromCookie = req.cookies.refreshToken;
    const deviceId = req.params.deviceId;

    if (!refreshTokenFromCookie) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const user = await this.jwtService.getUserInfoByToken(refreshTokenFromCookie);

    if (!user) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const currentSession = await this.authService.getUserSessionByIdAndRefreshToken(
      user?.userId,
      refreshTokenFromCookie
    );

    if (!currentSession) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const deleteResult = await this.authService.removeSessionByDeviceAndUsersIds(deviceId, user.userId);
    const httpDeleteResult = ResultService.mapResultToHttpResponse(deleteResult);

    res.status(httpDeleteResult.statusCode).send(httpDeleteResult.body);
  }
}
