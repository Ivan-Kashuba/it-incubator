import { UserDbModel, UserViewModel } from '../types/model/UsersModels';

export const mapDbUsersToViewUsers = (dbUsers: UserDbModel[]) => {
  return dbUsers.map((dbUser) => {
    const viewUser: UserViewModel = {
      id: dbUser.id,
      createdAt: dbUser.createdAt,
      email: dbUser.email,
      login: dbUser.login,
    };

    return viewUser;
  });
};

export const mapDbUserToViewUser = (dbUser: UserDbModel) => {
  const viewUser: UserViewModel = {
    id: dbUser.id,
    createdAt: dbUser.createdAt,
    email: dbUser.email,
    login: dbUser.login,
  };

  return viewUser;
};
