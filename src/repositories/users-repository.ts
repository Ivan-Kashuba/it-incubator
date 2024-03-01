import { UserDbModel, UserViewModel } from '../domain/users/types/model/UsersModels';
import { PaginationPayload } from '../shared/types/Pagination';
import { getInsensitiveCaseSearchRegexString } from '../shared/helpers/getInsensitiveCaseSearchRegexString';
import { createPaginationResponse, getSkip, getSortDirectionMongoValue } from '../shared/helpers/pagination';
import { mapDbUsersToViewUsers } from '../domain/users/mappers/userMapers';
import { UserModel } from '../db/schemes/users';

export class UsersRepository {
  async createUser(user: UserDbModel) {
    const createResponse = await UserModel.create(user);
    return createResponse._id ? user.id : null;
  }

  async findUsers(
    pagination: PaginationPayload<UserViewModel>,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;
    const termsArray = [];

    if (searchLoginTerm) {
      termsArray.push({ 'accountData.login': getInsensitiveCaseSearchRegexString(searchLoginTerm) });
    }

    if (searchEmailTerm) {
      termsArray.push({ 'accountData.email': getInsensitiveCaseSearchRegexString(searchEmailTerm) });
    }

    const filters = termsArray.length ? { $or: termsArray } : {};

    const totalCount = await UserModel.countDocuments(filters);

    const foundedUsers = await UserModel.find(filters, { projection: { _id: 0 } })
      .sort({ [`accountData.${sortBy}`]: getSortDirectionMongoValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize);

    return createPaginationResponse<UserViewModel>(pagination, mapDbUsersToViewUsers(foundedUsers), totalCount);
  }

  async deleteUser(userId: string) {
    const deletedResponse = await UserModel.deleteOne({ id: userId });

    return deletedResponse.deletedCount === 1;
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return UserModel.findOne({
      $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
    }).lean();
  }

  async updateUserByLoginOrEmail(loginOrEmail: string, updateInfo: Partial<UserDbModel>) {
    return UserModel.findOneAndUpdate(
      {
        $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
      },
      {
        $set: {
          ...updateInfo,
        },
      }
    ).lean();
  }

  async findUserByRegistrationActivationCode(code: string) {
    return UserModel.findOne({ 'accountConfirmation.confirmationCode': code }).lean();
  }

  async findUserByPasswordRecoveryCode(code: string) {
    return UserModel.findOne({ 'passwordRecovery.confirmationCode': code }).lean();
  }
}

export const usersRepository = new UsersRepository();
