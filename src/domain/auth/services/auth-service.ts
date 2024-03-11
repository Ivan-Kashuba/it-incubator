import { AuthModel, UserTokenInfo } from '../types/model/Auth';
import { UsersRepository } from '../../../repositories/users-repository';
import { UserCreateModel, UserDbModel } from '../../users/types/model/UsersModels';
import { ObjectId } from 'mongodb';
import { add, isBefore } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { emailManager } from '../../../adapters/emailAdapter';
import { Details } from 'express-useragent';
import { Result, RESULT_CODES, ResultService } from '../../../shared/helpers/resultObject';
import { injectable } from 'inversify';
import { AuthRepository } from '../../../repositories/auth-repository';
import { JwtService } from '../../../application/jwtService';
@injectable()
export class AuthService {
  constructor(
    protected usersRepository: UsersRepository,
    protected authRepository: AuthRepository,
    protected jwtService: JwtService
  ) {}
  async loginByLoginOrEmail(credentials: AuthModel, userDeviceName: string, userIp: string) {
    const userByLoginOrEmail = await this.usersRepository.findUserByLoginOrEmail(credentials.loginOrEmail);

    if (!userByLoginOrEmail) return null;
    if (!userByLoginOrEmail?.accountConfirmation?.isConfirmed) return null;
    if (
      this.jwtService.createHash(credentials.password, userByLoginOrEmail?.accountData.salt) !==
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

    const expirationTokenDate = await this.jwtService.getJwtExpirationDate(refreshToken);

    await this.authRepository.addUserSession({
      _id: new ObjectId().toString(),
      userId: userByLoginOrEmail.id,
      ip: userIp,
      title: userDeviceName,
      deviceId: deviceId,
      lastActiveDate: expirationTokenDate!,
    });

    return { refreshToken, accessToken };
  }

  async registerUser(userInfo: UserCreateModel) {
    const salt = this.jwtService.createSalt(10);
    const confirmationCode = uuidv4();

    const currentDate = new Date().toISOString();

    const userSaveToDb: UserDbModel = {
      id: new ObjectId().toString(),
      accountData: {
        login: userInfo.login,
        email: userInfo.email,
        createdAt: currentDate,
        salt: salt,
        hash: this.jwtService.createHash(userInfo.password, salt),
      },
      accountConfirmation: {
        isConfirmed: false,
        confirmationCode,
        expirationDate: add(currentDate, { hours: 24 }).toISOString(),
      },
      passwordRecovery: {
        expirationDate: null,
        confirmationCode: null,
      },
    };

    const isMailSent = await emailManager.sendRegistrationConfirmEmail(userInfo.email, confirmationCode);

    if (isMailSent) {
      return await this.usersRepository.createUser(userSaveToDb);
    } else {
      return null;
    }
  }

  async resendRegistrationCode(userEmail: string) {
    const confirmationCode = uuidv4();

    const updateInfo: Partial<UserDbModel> = {
      accountConfirmation: {
        confirmationCode,
        isConfirmed: false,
        expirationDate: add(new Date(), { hours: 24 }).toISOString(),
      },
    };

    const updatedUser = await this.usersRepository.updateUserByLoginOrEmail(userEmail, updateInfo);
    const isMailSent = await emailManager.sendRegistrationConfirmEmail(userEmail, confirmationCode);

    return isMailSent && !!updatedUser;
  }

  async createJwtKeys(userInfo: UserTokenInfo) {
    const accessToken = await this.jwtService.createJwt(userInfo, '6m');
    const refreshToken = await this.jwtService.createJwt(userInfo, '30d');

    return {
      accessToken,
      refreshToken,
    };
  }

  getDeviceNameByUseragent(userAgent?: Details) {
    const platformPart = userAgent?.platform ? userAgent?.platform + ', ' : '';
    const browserPart = userAgent?.browser || '';

    return platformPart + browserPart;
  }

  async getUserSessionByIdAndRefreshToken(userId: string, refreshToken: string) {
    const usersSessions = await this.authRepository.getUserSessionsList(userId);

    const user = await this.jwtService.getUserInfoByToken(refreshToken);
    const refreshTokenExpirationDate = await this.jwtService.getJwtExpirationDate(refreshToken);

    if (!refreshTokenExpirationDate) return null;

    const session = usersSessions?.find((us) => {
      return us?.deviceId === user?.deviceId && refreshTokenExpirationDate === us.lastActiveDate;
    });

    if (!session) return null;

    return session;
  }

  async updateUserDeviceSession(sessionId: string, refreshToken: string) {
    const expirationTokenDate = await this.jwtService.getJwtExpirationDate(refreshToken);

    return await this.authRepository.updateUserDeviceSession(sessionId, {
      lastActiveDate: expirationTokenDate!,
    });
  }

  async removeAllButCurrentUserSession(userId: string, currentSessionId: string) {
    return await this.authRepository.removeAllButCurrentUserSession(userId, currentSessionId);
  }

  async removeSessionByDeviceAndUsersIds(deviceId: string, userId: string): Promise<Result<void>> {
    const sessionToRemove = await this.authRepository.getSessionByDeviceId(deviceId);

    if (!sessionToRemove) {
      return ResultService.createResult(RESULT_CODES.Not_found);
    }

    const isSessionBelongToUser = sessionToRemove.userId === userId;

    if (!isSessionBelongToUser) {
      return ResultService.createResult(RESULT_CODES.Forbidden, 'User is not allowed to delete this session');
    }

    const isDeleted = await this.authRepository.removeUserSession(sessionToRemove._id);

    if (isDeleted) {
      return ResultService.createResult(RESULT_CODES.Success_no_content);
    }

    return ResultService.createResult(RESULT_CODES.Db_problem);
  }

  async recoveryPassword(email: string) {
    const confirmationCode = uuidv4();

    const user = await this.usersRepository.findUserByLoginOrEmail(email);

    if (!user) {
      return true;
    }

    const isEmailSent = await emailManager.sendPasswordRecoveryEmail(email, confirmationCode);

    const isUserInDbUpdated = await this.usersRepository.updateUserByLoginOrEmail(email, {
      passwordRecovery: {
        confirmationCode,
        expirationDate: add(new Date(), { hours: 24 }).toISOString(),
      },
    });

    return !!isUserInDbUpdated && isEmailSent;
  }

  async setNewPasswordForUserByCode(code: string, newPassword: string): Promise<Result<boolean>> {
    const user = await this.usersRepository.findUserByPasswordRecoveryCode(code);

    if (!user) {
      return ResultService.createResult(
        RESULT_CODES.Bad_request,
        ResultService.createError('recoveryCode', 'User with current recovery code is not found')
      );
    }

    const expirationDate = user.passwordRecovery.expirationDate;

    if (!expirationDate) {
      return ResultService.createResult(
        RESULT_CODES.Db_problem,
        ResultService.createError('expirationDate', 'No expiration date in user')
      );
    }

    const isCodeExpired = isBefore(expirationDate, new Date());

    if (isCodeExpired) {
      return ResultService.createResult(
        RESULT_CODES.Bad_request,
        ResultService.createError('recoveryCode', 'Code is expired')
      );
    }

    const salt = this.jwtService.createSalt(10);

    const isUserInDbUpdated = await this.usersRepository.updateUserByLoginOrEmail(user.accountData.login, {
      accountData: {
        ...user.accountData,
        salt: salt,
        hash: this.jwtService.createHash(newPassword, salt),
      },
      passwordRecovery: {
        confirmationCode: null,
        expirationDate: null,
      },
    });

    if (!isUserInDbUpdated) {
      return ResultService.createResult(RESULT_CODES.Db_problem, undefined, true);
    }

    return ResultService.createResult(RESULT_CODES.Success_no_content, undefined, true);
  }
}
