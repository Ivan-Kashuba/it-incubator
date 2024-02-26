import { STATUS_HTTP } from '../../src/shared/types';
import { getRequest, SuperTestBodyResponse } from './shared';
import { AuthModel } from '../../src/domain/auth/types/model/Auth';
import { UserCreateModel } from '../../src/domain/users/types/model/UsersModels';
import { UserTestManager } from './UserTestManager';
import { jwtService } from '../../src/application/jwtService';
import { Response } from 'supertest';

export class AuthTestManagerClass {
  async login(data: AuthModel, expectedStatus = STATUS_HTTP.OK_200) {
    const createResponse = await getRequest().post('/auth/login').send(data).expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.OK_200) {
      const successfulCreateResponse: SuperTestBodyResponse<{ accessToken: string }> = createResponse;
      const createdTokenResponse = successfulCreateResponse?.body;
      const refreshToken = this.getRefreshTokenByResponse(createResponse);

      expect(createdTokenResponse).toEqual({
        accessToken: expect.any(String),
      });

      const userPayload = await jwtService.getUserInfoByToken(refreshToken!);
      expect([userPayload?.login, userPayload?.email].includes(data.loginOrEmail)).toBe(true);

      return { createResponse: successfulCreateResponse, createdTokenResponse, refreshToken };
    }

    return { createResponse };
  }

  async createUserAndLogin(userData: UserCreateModel) {
    const { createdUser } = await UserTestManager.createUser(userData);

    const { createdTokenResponse, refreshToken } = await this.login({
      loginOrEmail: createdUser!.login,
      password: userData.password,
    });

    return { createdUser, accessToken: createdTokenResponse!.accessToken, refreshToken };
  }

  getRefreshTokenByResponse(response: Response) {
    return response.get('Set-Cookie')?.length
      ? response.get('Set-Cookie')[0]?.split('refreshToken=')[1]?.split(';')[0]
      : null;
  }
}

export const AuthTestManager = new AuthTestManagerClass();
