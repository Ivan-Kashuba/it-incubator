export type UserDbModel = {
  _id?: string;
  id: string;
  login: string;
  email: string;
  createdAt: string;
  salt: string;
  hash: string;
};

export type UserViewModel = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserCreateModel = {
  login: string;
  password: string;
  email: string;
};
