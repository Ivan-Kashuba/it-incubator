import { AuthService } from '../domain/auth/services/auth-service';
import { AuthRepository } from '../repositories/auth-repository';
import { UsersRepository } from '../repositories/users-repository';
import { JwtService } from '../application/jwtService';
import { RequestWithBody, STATUS_HTTP } from '../shared/types/index';
import { AuthModel, PasswordRecoveryInputModel } from '../domain/auth/types/model/Auth';
import { Request, Response } from 'express';
import { UserCreateModel } from '../domain/users/types/model/UsersModels';
import { ResultService } from '../shared/helpers/resultObject';
import { injectable } from 'inversify';

@injectable()
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected authRepository: AuthRepository,
    protected usersRepository: UsersRepository,
    protected jwtService: JwtService
  ) {}

  async login(req: RequestWithBody<AuthModel>, res: Response) {
    const userDeviceName = this.authService.getDeviceNameByUseragent(req.useragent);
    const userIp = req.ip;

    const tokens = await this.authService.loginByLoginOrEmail(req.body, userDeviceName, userIp as string);
    if (tokens?.accessToken && tokens?.refreshToken) {
      res
        .status(STATUS_HTTP.OK_200)
        .cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true })
        .send({
          accessToken: tokens.accessToken,
        });
      return;
    }

    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
  }

  async register(req: RequestWithBody<UserCreateModel>, res: Response) {
    const createdUserId = await this.authService.registerUser(req.body);

    if (createdUserId) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
  }

  async resendRegistrationEmail(req: RequestWithBody<{ email: string }>, res: Response) {
    const isCodeResent = await this.authService.resendRegistrationCode(req.body.email);

    if (isCodeResent) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async confirmRegistration(req: RequestWithBody<{ code: string }>, res: Response) {
    const user = await this.usersRepository.findUserByRegistrationActivationCode(req.body.code);
    const updatedUser = await this.usersRepository.updateUserByLoginOrEmail(user!.accountData!.email, {
      'accountConfirmation.isConfirmed': true,
      'accountConfirmation.confirmationCode': null,
      'accountConfirmation.expirationDate': null,
    } as any);

    if (!!updatedUser) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async me(req: Request, res: Response) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const userInfo = await this.jwtService.getUserInfoByToken(token);

    if (userInfo) {
      res.status(STATUS_HTTP.OK_200).send({
        email: userInfo.email,
        login: userInfo.login,
        userId: userInfo.userId,
      });
      return;
    }

    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
  }

  async refreshToken(req: Request, res: Response) {
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

    const session = await this.authService.getUserSessionByIdAndRefreshToken(user.userId, refreshTokenFromCookie);

    if (!session) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const { accessToken, refreshToken } = await this.authService.createJwtKeys(user);
    await this.authService.updateUserDeviceSession(session._id, refreshToken);

    res.status(STATUS_HTTP.OK_200).cookie('refreshToken', refreshToken, { httpOnly: true, secure: true }).send({
      accessToken,
    });
  }

  async logout(req: Request, res: Response) {
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

    const validSession = await this.authService.getUserSessionByIdAndRefreshToken(user.userId, refreshTokenFromCookie);

    if (!validSession) {
      res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
      return;
    }

    const isSessionRemoved = await this.authRepository.removeUserSession(validSession._id);

    if (isSessionRemoved) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async recoveryPassword(req: RequestWithBody<{ email: string }>, res: Response) {
    try {
      const isPasswordRecovered = await this.authService.recoveryPassword(req.body.email);

      if (isPasswordRecovered) {
        res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
        return;
      }
    } catch {
      res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
    }
  }

  async setNewPassword(req: RequestWithBody<PasswordRecoveryInputModel>, res: Response) {
    try {
      const { newPassword, recoveryCode } = req.body;
      const serviceResult = await this.authService.setNewPasswordForUserByCode(recoveryCode, newPassword);

      const result = ResultService.mapResultToHttpResponse(serviceResult);

      res.status(result.statusCode).send(result.body);
    } catch {
      res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
    }
  }
}
