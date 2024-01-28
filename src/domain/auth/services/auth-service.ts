import bcrypt from 'bcrypt';
import { AuthModel } from '../types/model/Auth';
import { usersRepository } from '../../../repositories/users-repository';
import { jwtService } from '../../../application/jwtService';
import { UserCreateModel, UserDbModel } from '../../users/types/model/UsersModels';
import { ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { emailManager } from '../../../adapters/emailAdapter';

export const authService = {
  async loginByLoginOrEmail(credentials: AuthModel) {
    const userByLoginOrEmail = await usersRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

    if (!userByLoginOrEmail) return null;
    if (!userByLoginOrEmail.accountConfirmation.isConfirmed) return null;
    if (
      this._generateHashAndSoleByPasswordAndSalt(credentials.password, userByLoginOrEmail?.accountData.salt) !==
      userByLoginOrEmail.accountData.hash
    )
      return null;

    return await jwtService.createJwt(userByLoginOrEmail);
  },

  async registerUser(userInfo: UserCreateModel) {
    const salt = bcrypt.genSaltSync(10);
    const confirmationCode = uuidv4();

    const userSaveToDb: UserDbModel = {
      id: new ObjectId().toString(),
      accountData: {
        login: userInfo.login,
        email: userInfo.email,
        createdAt: new Date().toString(),
        salt: salt,
        hash: bcrypt.hashSync(userInfo.password, salt),
      },
      accountConfirmation: {
        isConfirmed: false,
        confirmationCode,
        expirationDate: add(new Date(), { hours: 24 }).toISOString(),
      },
    };

    const isMailSent = await emailManager.sendRegistrationConfirmEmail(userInfo.email, confirmationCode);

    if (isMailSent) {
      return await usersRepository.createUser(userSaveToDb);
    } else {
      return null;
    }
  },

  async resendRegistrationCode(userEmail: string) {
    const confirmationCode = uuidv4();

    const updateInfo: Partial<UserDbModel> = {
      accountConfirmation: {
        confirmationCode,
        isConfirmed: false,
        expirationDate: add(new Date(), { hours: 24 }).toISOString(),
      },
    };

    const updatedUser = usersRepository.updateUserByLoginOrEmail(userEmail, updateInfo);
    const isMailSent = await emailManager.sendRegistrationConfirmEmail(userEmail, confirmationCode);

    return isMailSent && !!updatedUser;
  },

  _generateHashAndSoleByPasswordAndSalt(password: string, salt: string | number) {
    return bcrypt.hashSync(password, salt);
  },
};
