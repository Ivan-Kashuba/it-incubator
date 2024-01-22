import express, { Response } from 'express';
import { RequestWithBody, RequestWithParams, RequestWithQuery, STATUS_HTTP } from '../shared/types';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';

import { adminAuthCheckMiddleware } from '../middlewares/adminAuthCheckMiddleware';
import { PaginationPayload } from '../shared/types/Pagination';
import { validatePayloadPagination } from '../shared/helpers/pagination';
import { inputUserValidation } from '../domain/users/validation/inputUserValidation';
import { UserCreateModel, UserViewModel } from '../domain/users/types/model/UsersModels';
import { usersService } from '../domain/users/services/users-service';
import { usersRepository } from '../domain/users/repositories/users-repository';
import { mapDbUserToViewUser } from '../domain/users/mapers/userMapers';

export const usersRouter = express.Router();

usersRouter.post(
  '/',
  adminAuthCheckMiddleware,
  inputUserValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<UserCreateModel>, res: Response) => {
    const createdUserId = await usersService.createUser(req.body);

    if (createdUserId) {
      const createdUser = await usersRepository.findUserByLoginOrEmail(req.body.login);
      const userViewModel = mapDbUserToViewUser(createdUser!);
      res.status(STATUS_HTTP.CREATED_201).send(userViewModel);
      return;
    }

    res.status(STATUS_HTTP.INTERNAL_ERROR_500);
  }
);

usersRouter.get(
  '/',
  adminAuthCheckMiddleware,
  async (
    req: RequestWithQuery<
      { searchLoginTerm?: string; searchEmailTerm?: string } & Partial<PaginationPayload<UserViewModel>>
    >,
    res: Response
  ) => {
    const searchLoginTerm = req.query.searchLoginTerm || null;
    const searchEmailTerm = req.query.searchEmailTerm || null;

    const pagination: PaginationPayload<UserViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const foundedUsers = await usersService.findUsers(pagination, searchLoginTerm, searchEmailTerm);

    if (foundedUsers) {
      res.status(STATUS_HTTP.OK_200).send(foundedUsers);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
  }
);

usersRouter.delete(
  '/:userId',
  adminAuthCheckMiddleware,
  async (req: RequestWithParams<{ userId: string }>, res: Response) => {
    const userId = req.params.userId;

    const isUserDeleted = await usersService.deleteUser(userId);

    if (isUserDeleted) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
  }
);