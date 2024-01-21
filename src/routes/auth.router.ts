import express, { Response } from 'express';
import { RequestWithBody, STATUS_HTTP } from '../shared/types';
import { AuthModel } from '../features/auth/types/model/Auth';
import { authModelValidation } from '../features/auth/validation/authModelValidation';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { authService } from '../features/auth/services/auth-service';

export const authRouter = express.Router();

authRouter.post(
  '/login',
  authModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<AuthModel>, res: Response) => {
    const isAuthorised = await authService.loginByLoginOrEmail(req.body);

    if (isAuthorised) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.UNAUTHORIZED_401);
  }
);
