import bcrypt from 'bcrypt';
import { AuthModel } from '../types/model/Auth';
import { usersRepository } from '../../users/repositories/users-repository';
import { jwtService } from '../../../application/jwtService';

export const authService = {
  async loginByLoginOrEmail(credentials: AuthModel) {
    const userByLoginOrEmail = await usersRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

    if (!userByLoginOrEmail) {
      return null;
    }

    if (
      this._generateHashAndSoleByPasswordAndSalt(credentials.password, userByLoginOrEmail?.salt) ===
      userByLoginOrEmail.hash
    ) {
      return await jwtService.createJwt(userByLoginOrEmail);
    }

    return null;
  },

  _generateHashAndSoleByPasswordAndSalt(password: string, salt: string | number) {
    return bcrypt.hashSync(password, salt);
  },
};
