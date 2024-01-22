export interface AuthModel {
  loginOrEmail: string;
  password: string;
}

export interface UserTokenInfo {
  email: string;
  login: string;
  userId: string;
}
