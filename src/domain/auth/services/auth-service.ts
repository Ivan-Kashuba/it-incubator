import bcrypt from 'bcrypt';
import { AuthModel, UserTokenInfo } from '../types/model/Auth';
import { usersRepository } from '../../../repositories/users-repository';
import { jwtService } from '../../../application/jwtService';
import { UserCreateModel, UserDbModel } from '../../users/types/model/UsersModels';
import { ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { emailManager } from '../../../adapters/emailAdapter';

import { authRepository } from '../../../repositories/auth-repository';
import { Details } from 'express-useragent';
import { Result, RESULT_CODES, ResultService } from '../../../shared/helpers/resultObject';

export const authService = {
  async loginByLoginOrEmail(credentials: AuthModel, userDeviceName: string, userIp: string) {
    const userByLoginOrEmail = await usersRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

    if (!userByLoginOrEmail) return null;
    if (!userByLoginOrEmail.accountConfirmation.isConfirmed) return null;
    if (
      this._generateHashAndSoleByPasswordAndSalt(credentials.password, userByLoginOrEmail?.accountData.salt) !==
      userByLoginOrEmail.accountData.hash
    )
      return null;

    const deviceId = new ObjectId().toString();

    const userInfo: UserTokenInfo = {
      userId: userByLoginOrEmail.id,
      email: userByLoginOrEmail.accountData.email,
      login: userByLoginOrEmail.accountData.login,
      deviceId: deviceId,
    };

    const { refreshToken, accessToken } = await this.createJwtKeys(userInfo);

    const expirationTokenDate = await jwtService.getJwtExpirationDate(refreshToken);

    await authRepository.addUserSession({
      _id: new ObjectId().toString(),
      userId: userByLoginOrEmail.id,
      ip: userIp,
      title: userDeviceName,
      deviceId: deviceId,
      lastActiveDate: expirationTokenDate!,
    });

    return { refreshToken, accessToken };
  },

  async registerUser(userInfo: UserCreateModel) {
    const salt = bcrypt.genSaltSync(10);
    const confirmationCode = uuidv4();

    const currentDate = new Date().toISOString();

    const userSaveToDb: UserDbModel = {
      id: new ObjectId().toString(),
      accountData: {
        login: userInfo.login,
        email: userInfo.email,
        createdAt: currentDate,
        salt: salt,
        hash: bcrypt.hashSync(userInfo.password, salt),
      },
      accountConfirmation: {
        isConfirmed: false,
        confirmationCode,
        expirationDate: add(currentDate, { hours: 24 }).toISOString(),
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

  async createJwtKeys(userInfo: UserTokenInfo) {
    const accessToken = await jwtService.createJwt(userInfo, '10s');
    const refreshToken = await jwtService.createJwt(userInfo, '20s');

    return {
      accessToken,
      refreshToken,
    };
  },

  getDeviceNameByUseragent(userAgent?: Details) {
    const platformPart = userAgent?.platform ? userAgent?.platform + ', ' : '';
    const browserPart = userAgent?.browser || '';

    return platformPart + browserPart;
  },

  async getUserSessionByIdAndRefreshToken(userId: string, refreshToken: string) {
    const usersSessions = await authRepository.getUserSessionsList(userId);

    const user = await jwtService.getUserInfoByToken(refreshToken);
    const refreshTokenExpirationDate = await jwtService.getJwtExpirationDate(refreshToken);

    if (!refreshTokenExpirationDate) return null;

    const session = usersSessions?.find((us) => {
      return us?.deviceId === user?.deviceId && refreshTokenExpirationDate === us.lastActiveDate;
    });

    if (!session) return null;

    return session;
  },

  async updateUserDeviceSession(sessionId: string, refreshToken: string) {
    const expirationTokenDate = await jwtService.getJwtExpirationDate(refreshToken);

    return await authRepository.updateUserDeviceSession(sessionId, {
      lastActiveDate: expirationTokenDate!,
    });
  },

  async removeAllButCurrentUserSession(userId: string, currentSessionId: string) {
    return await authRepository.removeAllButCurrentUserSession(userId, currentSessionId);
  },

  async removeSessionByDeviceAndUsersIds(deviceId: string, userId: string): Promise<Result<void>> {
    const sessionToRemove = await authRepository.getSessionByDeviceId(deviceId);

    if (!sessionToRemove) {
      return ResultService.createResult(RESULT_CODES.Not_found);
    }

    const isSessionBelongToUser = sessionToRemove.userId === userId;

    if (!isSessionBelongToUser) {
      return ResultService.createResult(RESULT_CODES.Forbidden, 'User is not allowed to delete this session');
    }

    const isDeleted = await authRepository.removeUserSession(sessionToRemove._id);

    if (isDeleted) {
      return ResultService.createResult(RESULT_CODES.Success_no_content);
    }

    return ResultService.createResult(RESULT_CODES.Db_problem);
  },

  _generateHashAndSoleByPasswordAndSalt(password: string, salt: string | number) {
    return bcrypt.hashSync(password, salt);
  },
};
