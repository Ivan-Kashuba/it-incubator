import jwt, { SignOptions } from 'jsonwebtoken';
import { envConfig } from '../shared/helpers/env-config';
import { UserTokenInfo } from '../domain/auth/types/model/Auth';

export const jwtService = {
  async createJwt(userInfo: UserTokenInfo, expiresIn: SignOptions['expiresIn']) {
    return jwt.sign(
      { userId: userInfo.userId, email: userInfo.email, login: userInfo.login },
      envConfig.JWT_SECRET_KEY,
      {
        expiresIn,
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
