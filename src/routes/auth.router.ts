import express, { Request, Response } from 'express';
import { localDb } from '../db/local-db';
import { RequestWithBody, STATUS_HTTP } from '../shared/types';
import { AuthModel } from '../features/auth/types/model/Auth';
import { authModelValidation } from '../features/auth/validation/authModelValidation';
import { validationResult } from 'express-validator';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';

export const authRouter = express.Router();

authRouter.post(
  '/',
  authModelValidation,
  validationCheckMiddleware,
  (req: RequestWithBody<AuthModel>, res: Response) => {
    const { login, password } = req.body;

    const basicToken = Buffer.from(`${login}:${password}`).toString('base64');

    res.status(STATUS_HTTP.OK_200).json(basicToken);
  }
);