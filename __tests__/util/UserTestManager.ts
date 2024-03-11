import { STATUS_HTTP } from '../../src/shared/types';
import { getAdminAllowedRequest, SuperTestBodyResponse } from './shared';
import { ISO_STRING_REGEX } from '../../src/shared/helpers/regex';
import { UserCreateModel, UserViewModel } from '../../src/domain/users/types/model/UsersModels';
import { injectable } from 'inversify';

@injectable()
export class UserTestManagerClass {
  async createUser(data: UserCreateModel, expectedStatus = STATUS_HTTP.CREATED_201) {
    const createResponse = await getAdminAllowedRequest().post('/users').send(data).expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.CREATED_201) {
      const successfulCreateResponse: SuperTestBodyResponse<UserViewModel> = createResponse;
      const createdUser = successfulCreateResponse?.body;

      expect(createdUser).toEqual({
        id: expect.any(String),
        createdAt: expect.stringMatching(ISO_STRING_REGEX),
        login: data.login,
        email: data.email,
      });

      return { createResponse: successfulCreateResponse, createdUser };
    }

    return { createResponse };
  }
}

export const defaultUsersInputData: UserCreateModel[] = [
  { email: 'Email1@gm.com', password: '123456789', login: 'Login1' },
  { email: 'Email2@gm.com', password: '123456789', login: 'Login2' },
  { email: 'Email3@gm.com', password: '123456789', login: 'Login3' },
  { email: 'Email4@gm.com', password: '123456789', login: 'Login4' },
  { email: 'Email5@gm.com', password: '123456789', login: 'Login5' },
];
