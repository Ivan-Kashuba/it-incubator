import { STATUS_HTTP } from '../../src/shared/types';
import { getAdminAllowedRequest, SuperTestBodyResponse } from './shared';
import { AuthModel } from '../../src/domain/auth/types/model/Auth';
import { UserCreateModel } from '../../src/domain/users/types/model/UsersModels';
import { UserTestManager } from './UserTestManager';

export class AuthTestManagerClass {
  async login(data: AuthModel, expectedStatus = STATUS_HTTP.OK_200) {
    const createResponse = await getAdminAllowedRequest().post('/auth/login').send(data).expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.OK_200) {
      const successfulCreateResponse: SuperTestBodyResponse<{ accessToken: string }> = createResponse;
      const createdTokenResponse = successfulCreateResponse?.body;

      expect(createdTokenResponse).toEqual({
        accessToken: expect.any(String),
      });

      return { createResponse: successfulCreateResponse, createdTokenResponse };
    }

    return { createResponse };
  }

  async createUserAndLogin(userData: UserCreateModel) {
    const { createdUser } = await UserTestManager.createUser(userData);

    const { createdTokenResponse } = await this.login({
      loginOrEmail: createdUser!.login,
      password: userData.password,
    });

    return { createdUser, token: createdTokenResponse!.accessToken };
  }
}

export const AuthTestManager = new AuthTestManagerClass();
