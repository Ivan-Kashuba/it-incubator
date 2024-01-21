import { UserDbModel, UserViewModel } from '../types/model/UsersModels';
import { usersCollection } from '../../../db/mongoDb';
import { PaginationPayload } from '../../../shared/types/Pagination';
import { getInsensitiveCaseSearchRegexString } from '../../../shared/helpers/getInsensitiveCaseSearchRegexString';
import { createPaginationResponse, getSkip, getSortValue } from '../../../shared/helpers/pagination';
import { mapDbUsersToViewUsers } from '../mapers/userMapers';

export const usersRepository = {
  async createUser(user: UserDbModel) {
    const createResponse = await usersCollection.insertOne(user);
    return createResponse.insertedId;
  },

  async findUsers(
    pagination: PaginationPayload<UserViewModel>,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;
    const termsArray = [];

    if (searchLoginTerm) {
      termsArray.push({ login: getInsensitiveCaseSearchRegexString(searchLoginTerm) });
    }

    if (searchEmailTerm) {
      termsArray.push({ email: getInsensitiveCaseSearchRegexString(searchEmailTerm) });
    }

    const filters = termsArray.length ? { $or: termsArray } : {};

    const totalCount = await usersCollection.countDocuments(filters);

    const foundedUsers = await usersCollection
      .find(filters, { projection: { _id: 0 } })
      .sort({ [sortBy]: getSortValue(sortDirection) })
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
    return await usersCollection.findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] });
  },
};
