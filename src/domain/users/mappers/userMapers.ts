import { UserDbModel, UserViewModel } from '../types/model/UsersModels';

export const mapDbUsersToViewUsers = (dbUsers: UserDbModel[]) => {
  return dbUsers.map(mapDbUserToViewUser);
};

export const mapDbUserToViewUser = (dbUser: UserDbModel) => {
  const viewUser: UserViewModel = {
    id: dbUser.id,
    createdAt: dbUser.accountData.createdAt,
    email: dbUser.accountData.email,
    login: dbUser.accountData.login,
  };

  return viewUser;
};
