import express, { Request, Response } from 'express';
import { RequestWithBody, STATUS_HTTP } from '../shared/types';

import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { jwtService } from '../application/jwtService';
import { AuthModel, PasswordRecoveryInputModel } from '../domain/auth/types/model/Auth';
import { authService } from '../domain/auth/services/auth-service';
import { authModelValidation } from '../domain/auth/validation/authModelValidation';
import { userAuthCheckMiddleware } from '../middlewares/userAuthCheckMiddleware';
import { inputUserValidation } from '../domain/users/validation/inputUserValidation';
import { UserCreateModel } from '../domain/users/types/model/UsersModels';
import { confirmationByRegistrationCodeValidation } from '../domain/auth/validation/confirmationByRegistrationCodeValidation';
import { usersRepository } from '../repositories/users-repository';
import { authRepository } from '../repositories/auth-repository';
import { setRateLimit } from '../middlewares/rateLimit';
import { passwordRecoveryValidation } from '../domain/auth/validation/passwordRecoveryValidation';
import { resendEmailForRegistrationConfirmationValidation } from '../domain/auth/validation/resendEmailForRegistrationConfirmationValidation';
import { changePasswordValidation } from '../domain/auth/validation/changePasswordValidation';
import { ResultService } from '../shared/helpers/resultObject';

export const authRouter = express.Router();

class UserController {
  async login(req: RequestWithBody<AuthModel>, res: Response) {
    const userDeviceName = authService.getDeviceNameByUseragent(req.useragent);
    const userIp = req.ip;

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
  async register(req: RequestWithBody<UserCreateModel>, res: Response) {
    const createdUserId = await authService.registerUser(req.body);

    if (createdUserId) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
  }

  async resendRegistrationEmail(req: RequestWithBody<{ email: string }>, res: Response) {
    const isCodeResent = await authService.resendRegistrationCode(req.body.email);

    if (isCodeResent) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async confirmRegistration(req: RequestWithBody<{ code: string }>, res: Response) {
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

  async me(req: Request, res: Response) {
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
  }

  async refreshToken(req: Request, res: Response) {
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
  }

  async logout(req: Request, res: Response) {
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

    const validSession = await authService.getUserSessionByIdAndRefreshToken(user.userId, refreshTokenFromCookie);

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
  }

  async recoveryPassword(req: RequestWithBody<{ email: string }>, res: Response) {
    try {
      const isPasswordRecovered = await authService.recoveryPassword(req.body.email);

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
      const serviceResult = await authService.setNewPasswordForUserByCode(recoveryCode, newPassword);

      const result = ResultService.mapResultToHttpResponse(serviceResult);

      res.status(result.statusCode).send(result.body);
    } catch {
      res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
    }
  }
}
const userController = new UserController();

authRouter.post('/login', setRateLimit(), authModelValidation, validationCheckMiddleware, userController.login);

authRouter.post(
  '/registration',
  setRateLimit(),
  inputUserValidation,
  validationCheckMiddleware,
  userController.register
);

authRouter.post(
  '/registration-email-resending',
  setRateLimit(),
  resendEmailForRegistrationConfirmationValidation,
  validationCheckMiddleware,
  userController.resendRegistrationEmail
);

authRouter.post(
  '/registration-confirmation',
  setRateLimit(),
  confirmationByRegistrationCodeValidation,
  validationCheckMiddleware,
  userController.confirmRegistration
);

authRouter.get('/me', userAuthCheckMiddleware, userController.me);

authRouter.post('/refresh-token', userController.refreshToken);

authRouter.post('/logout', userController.logout);

authRouter.post(
  '/password-recovery',
  setRateLimit(),
  passwordRecoveryValidation,
  validationCheckMiddleware,
  userController.recoveryPassword
);

authRouter.post(
  '/new-password',
  setRateLimit(),
  changePasswordValidation,
  validationCheckMiddleware,
  userController.setNewPassword
);
