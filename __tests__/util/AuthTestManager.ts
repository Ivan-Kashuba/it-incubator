import { STATUS_HTTP } from '../../src/shared/types';
import { getRequest, SuperTestBodyResponse } from './shared';
import { AuthModel } from '../../src/domain/auth/types/model/Auth';
import { UserCreateModel } from '../../src/domain/users/types/model/UsersModels';
import { Response } from 'supertest';
import { jwtService } from '../../src/composition-root';
import { injectable } from 'inversify';
import { UserTestManagerClass } from './UserTestManager';
@injectable()
export class AuthTestManagerClass {
  constructor(protected UserTestManager: UserTestManagerClass) {}

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
    const { createdUser } = await this.UserTestManager.createUser(userData);

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
