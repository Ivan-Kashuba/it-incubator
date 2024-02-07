import { UserDbModel, UserViewModel } from '../domain/users/types/model/UsersModels';
import { usersCollection } from '../db/mongoDb';
import { PaginationPayload } from '../shared/types/Pagination';
import { getInsensitiveCaseSearchRegexString } from '../shared/helpers/getInsensitiveCaseSearchRegexString';
import { createPaginationResponse, getSkip, getSortDirectionMongoValue } from '../shared/helpers/pagination';
import { mapDbUsersToViewUsers } from '../domain/users/mappers/userMapers';

export const usersRepository = {
  async createUser(user: UserDbModel) {
    const createResponse = await usersCollection.insertOne(user);
    return createResponse.insertedId ? user.id : null;
  },

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

    const totalCount = await usersCollection.countDocuments(filters);

    const foundedUsers = await usersCollection
      .find(filters, { projection: { _id: 0 } })
      .sort({ [`accountData.${sortBy}`]: getSortDirectionMongoValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize)
      .toArray();

    return createPaginationResponse<UserViewModel>(pagination, mapDbUsersToViewUsers(foundedUsers), totalCount);
  },
  async deleteUser(userId: string) {
    const deletedResponse = await usersCollection.deleteOne({ id: userId });

    return deletedResponse.deletedCount === 1;
  },

  async findUserByLoginOrEmail(loginOrEmail: string) {
    return await usersCollection.findOne({
      $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
    });
  },

  async updateUserByLoginOrEmail(loginOrEmail: string, updateInfo: Partial<UserDbModel>) {
    return await usersCollection.findOneAndUpdate(
      {
        $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }],
      },
      {
        $set: {
          ...updateInfo,
        },
      }
    );
  },

  async findUserByRegistrationActivationCode(code: string) {
    return await usersCollection.findOne({ 'accountConfirmation.confirmationCode': code });
  },
};
