import jwt from 'jsonwebtoken';
import { envConfig } from '../shared/helpers/env-config';
import { UserDbModel } from '../domain/users/types/model/UsersModels';
import { UserTokenInfo } from '../domain/auth/types/model/Auth';

export const jwtService = {
  async createJwt(user: UserDbModel) {
    return jwt.sign(
      { userId: user.id, email: user.accountData.email, login: user.accountData.login },
      envConfig.JWT_SECRET_KEY,
      {
        expiresIn: '1d',
      }
    );
  },

  async getUserInfoByToken(token: string) {
    try {
      const result: any = jwt.verify(token, envConfig.JWT_SECRET_KEY);

      return { userId: result.userId, email: result.email, login: result.login } as UserTokenInfo;
    } catch (err) {
      return null;
    }
  },
};
