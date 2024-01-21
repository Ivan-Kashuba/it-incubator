import { STATUS_HTTP } from '../../src/shared/types';
import { getRequest, SuperTestBodyResponse } from './shared';
import { BlogInputModel, BlogPostInputModel, BlogViewModel } from '../../src/features/blogs/types/model/BlogModels';
import { ISO_STRING_REGEX } from '../../src/shared/helpers/regex';
import { PostViewModel } from '../../src/features/posts/types/model/PostModels';
import { UserCreateModel, UserViewModel } from '../../src/features/users/types/model/UsersModels';

export class UserManagerClass {
  async createUser(data: UserCreateModel, expectedStatus = STATUS_HTTP.CREATED_201) {
    const createResponse = await getRequest().post('/users').send(data).expect(expectedStatus);

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

export const UserManager = new UserManagerClass();
