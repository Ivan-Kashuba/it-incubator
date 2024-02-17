import express, { Request, Response } from 'express';
import { RequestWithBody, STATUS_HTTP } from '../shared/types';

import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { jwtService } from '../application/jwtService';
import { AuthModel } from '../domain/auth/types/model/Auth';
import { authService } from '../domain/auth/services/auth-service';
import { authModelValidation } from '../domain/auth/validation/authModelValidation';
import { userAuthCheckMiddleware } from '../middlewares/userAuthCheckMiddleware';
import { inputUserValidation } from '../domain/users/validation/inputUserValidation';
import { UserCreateModel } from '../domain/users/types/model/UsersModels';
import { resendEmailForRegistrationConfirmationValidation } from '../domain/auth/validation/resendEmailForRegistrationConfirmationValidation';
import { confirmationByRegistrationCodeValidation } from '../domain/auth/validation/confirmationByRegistrationCodeValidation';
import { usersRepository } from '../repositories/users-repository';
import { authRepository } from '../repositories/auth-repository';
import { securityQueryRepository } from '../repositories/security-query-repository';

export const authRouter = express.Router();

authRouter.post(
  '/login',
  authModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<AuthModel>, res: Response) => {
    const userDeviceName = authService.getDeviceNameByUseragent(req.useragent);
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const tokens = await authService.loginByLoginOrEmail(req.body, userDeviceName, userIp as string);

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
);

authRouter.post(
  '/registration',
  inputUserValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<UserCreateModel>, res: Response) => {
    const createdUserId = await authService.registerUser(req.body);

    if (createdUserId) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
  }
);

authRouter.post(
  '/registration-email-resending',
  resendEmailForRegistrationConfirmationValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<{ email: string }>, res: Response) => {
    const isCodeResent = await authService.resendRegistrationCode(req.body.email);

    if (isCodeResent) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }
);

authRouter.post(
  '/registration-confirmation',
  confirmationByRegistrationCodeValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<{ code: string }>, res: Response) => {
    const user = await usersRepository.findUserByRegistrationActivationCode(req.body.code);
    const updatedUser = await usersRepository.updateUserByLoginOrEmail(user!.accountData!.email, {
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
);

authRouter.get('/me', userAuthCheckMiddleware, async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const userInfo = await jwtService.getUserInfoByToken(token);

  if (userInfo) {
    res.status(STATUS_HTTP.OK_200).send({
      email: userInfo.email,
      login: userInfo.login,
      userId: userInfo.userId,
    });
    return;
  }

  res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
});

authRouter.post('/refresh-token', async (req: Request, res: Response) => {
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

  const session = await authService.getUserSessionByIdAndRefreshToken(user.userId, refreshTokenFromCookie);

  if (!session) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const { accessToken, refreshToken } = await authService.createJwtKeys(user);
  await authService.updateUserDeviceSession(session._id, refreshToken);

  res.status(STATUS_HTTP.OK_200).cookie('refreshToken', refreshToken, { httpOnly: true, secure: true }).send({
    accessToken,
  });
});

authRouter.post('/logout', userAuthCheckMiddleware, async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const validSession = await authService.getUserSessionByIdAndRefreshToken(req.user.userId, refreshTokenFromCookie);

  if (!validSession) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const isSessionRemoved = await authRepository.removeUserSession(validSession._id);

  if (isSessionRemoved) {
    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    return;
  }

  res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
});
