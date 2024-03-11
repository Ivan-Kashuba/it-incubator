import { RequestWithBody, RequestWithParams, RequestWithQuery, STATUS_HTTP } from '../shared/types/index';
import { UserCreateModel, UserViewModel } from '../domain/users/types/model/UsersModels';
import { Response } from 'express';
import { UsersService } from '../domain/users/services/users-service';
import { UsersRepository } from '../repositories/users-repository';
import { mapDbUserToViewUser } from '../domain/users/mappers/userMapers';
import { PaginationPayload } from '../shared/types/Pagination';
import { validatePayloadPagination } from '../shared/helpers/pagination';
import { injectable } from 'inversify';

@injectable()
export class UsersController {
  constructor(
    protected usersRepository: UsersRepository,
    protected usersService: UsersService
  ) {}
  async createUser(req: RequestWithBody<UserCreateModel>, res: Response) {
    const createdUserId = await this.usersService.createUser(req.body);

    if (createdUserId) {
      const createdUser = await this.usersRepository.findUserByLoginOrEmail(req.body.login);
      const userViewModel = mapDbUserToViewUser(createdUser!);
      res.status(STATUS_HTTP.CREATED_201).send(userViewModel);
      return;
    }

    res.status(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async getUsers(
    req: RequestWithQuery<
      { searchLoginTerm?: string; searchEmailTerm?: string } & Partial<PaginationPayload<UserViewModel>>
    >,
    res: Response
  ) {
    const searchLoginTerm = req.query.searchLoginTerm || null;
    const searchEmailTerm = req.query.searchEmailTerm || null;

    const pagination: PaginationPayload<UserViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const foundedUsers = await this.usersService.findUsers(pagination, searchLoginTerm, searchEmailTerm);

    if (foundedUsers) {
      res.status(STATUS_HTTP.OK_200).send(foundedUsers);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
  }

  async deleteUser(req: RequestWithParams<{ userId: string }>, res: Response) {
    const userId = req.params.userId;

    const isUserDeleted = await this.usersService.deleteUser(userId);

    if (isUserDeleted) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
  }
}
