import bcrypt from 'bcrypt';
import { AuthModel } from '../types/model/Auth';
import { usersRepository } from '../../users/repositories/users-repository';

export const authService = {
  async loginByLoginOrEmail(credentials: AuthModel) {
    const userByLoginOrEmail = await usersRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

    if (!userByLoginOrEmail) {
      return false;
    }

    return (
      this._generateHashAndSoleByPasswordAndSalt(credentials.password, userByLoginOrEmail?.salt) ===
      userByLoginOrEmail.hash
    );
  },

  _generateHashAndSoleByPasswordAndSalt(password: string, salt: string | number) {
    return bcrypt.hashSync(password, salt);
  },
};
