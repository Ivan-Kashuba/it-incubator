export type UserDbModel = {
  _id?: string;
  id: string;
  accountData: {
    login: string;
    email: string;
    createdAt: string;
    salt: string;
    hash: string;
  };
  accountConfirmation: {
    confirmationCode: string | null;
    expirationDate: string | null;
    isConfirmed: boolean;
  };
  passwordRecovery: {
    confirmationCode: string | null;
    expirationDate: string | null;
  };
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
