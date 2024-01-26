import express, { Response, Request } from 'express';
import { RequestWithBody, STATUS_HTTP } from '../shared/types';

import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';

import { adminAuthCheckMiddleware } from '../middlewares/adminAuthCheckMiddleware';
import { jwtService } from '../application/jwtService';
import { AuthModel } from '../domain/auth/types/model/Auth';
import { authService } from '../domain/auth/services/auth-service';
import { authModelValidation } from '../domain/auth/validation/authModelValidation';
import { userAuthCheckMiddleware } from '../middlewares/userAuthCheckMiddleware';

export const authRouter = express.Router();

authRouter.post(
  '/login',
  authModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<AuthModel>, res: Response) => {
    const token = await authService.loginByLoginOrEmail(req.body);

    if (token) {
      res.status(STATUS_HTTP.OK_200).send({
        accessToken: token,
      });
      return;
    }

    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
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
