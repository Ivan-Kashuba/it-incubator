import { UserCreateModel, UserDbModel, UserViewModel } from '../types/model/UsersModels';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { usersRepository } from '../../../repositories/users-repository';
import { PaginationPayload } from '../../../shared/types/Pagination';

export class UsersService {
  async createUser(userPayload: UserCreateModel) {
    const { login, password, email } = userPayload;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const isLoginExists = await usersRepository.findUserByLoginOrEmail(login);
    const isEmailExists = await usersRepository.findUserByLoginOrEmail(email);

    if (isLoginExists || isEmailExists) {
      return null;
    }

    const userToSave: UserDbModel = {
      id: new ObjectId().toString(),
      accountData: {
        login,
        email,
        hash,
        salt,
        createdAt: new Date().toISOString(),
      },
      accountConfirmation: {
        confirmationCode: null,
        isConfirmed: true,
        expirationDate: null,
      },
      passwordRecovery: {
        confirmationCode: null,
        expirationDate: null,
      },
    };

    return await usersRepository.createUser(userToSave);
  }

  async findUsers(
    pagination: PaginationPayload<UserViewModel>,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null
  ) {
    return await usersRepository.findUsers(pagination, searchLoginTerm, searchEmailTerm);
  }

  async deleteUser(userId: string) {
    return await usersRepository.deleteUser(userId);
  }
}

export const usersService = new UsersService();
