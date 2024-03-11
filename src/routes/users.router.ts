import express from 'express';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';

import { adminAuthCheckMiddleware } from '../middlewares/adminAuthCheckMiddleware';
import { inputUserValidation } from '../domain/users/validation/inputUserValidation';
import { container } from '../composition-root';
import { UsersController } from '../controllers/users-controller';

export const usersRouter = express.Router();

const usersController = container.get(UsersController);

usersRouter.post(
  '/',
  adminAuthCheckMiddleware,
  inputUserValidation,
  validationCheckMiddleware,
  usersController.createUser
);

usersRouter.get('/', adminAuthCheckMiddleware, usersController.getUsers);

usersRouter.delete('/:userId', adminAuthCheckMiddleware, usersController.deleteUser);
