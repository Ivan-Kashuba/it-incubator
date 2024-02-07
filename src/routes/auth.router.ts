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
import { JWT_BLACK_LIST } from '../db/mongoDb';

export const authRouter = express.Router();

authRouter.post(
  '/login',
  authModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<AuthModel>, res: Response) => {
    const refreshTokenFromCookie = req.cookies.refreshToken;
    const tokens = await authService.loginByLoginOrEmail(req.body);

    if (tokens?.accessToken && tokens?.refreshToken) {
      refreshTokenFromCookie && (await authService.addRefreshJwtToBlacklist(refreshTokenFromCookie));

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
    res.status(STATUS_HTTP.OK_200).send(userInfo);
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

  if (JWT_BLACK_LIST.includes(refreshTokenFromCookie)) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const userInfo = await jwtService.getUserInfoByToken(refreshTokenFromCookie);

  if (!userInfo) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  await authService.addRefreshJwtToBlacklist(refreshTokenFromCookie);

  const { accessToken, refreshToken } = await authService.createJwtKeys(userInfo);

  res.status(STATUS_HTTP.OK_200).cookie('refreshToken', refreshToken, { httpOnly: true, secure: true }).send({
    accessToken,
  });
});

authRouter.post('/logout', async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (!refreshTokenFromCookie || JWT_BLACK_LIST.includes(refreshTokenFromCookie)) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const userInfo = await jwtService.getUserInfoByToken(refreshTokenFromCookie);

  if (!userInfo) {
    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
    return;
  }

  const isAddedToBlackList = await authService.addRefreshJwtToBlacklist(refreshTokenFromCookie);

  if (isAddedToBlackList) {
    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    return;
  }

  res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
});
