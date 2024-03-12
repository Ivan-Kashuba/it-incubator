import { STATUS_HTTP } from '../src/shared/types';
import { getAdminAllowedRequest } from './util/shared';
import { ErrorResponse } from '../src/shared/types/Error';
import { UserViewModel } from '../src/domain/users/types/model/UsersModels';
import mongoose from 'mongoose';
import { envConfig } from '../src/shared/helpers/env-config';
import { UserTestManager } from './index';

let user1: UserViewModel = {} as UserViewModel;
let user2: UserViewModel = {} as UserViewModel;
let user3: UserViewModel = {} as UserViewModel;

describe('Users', () => {
  beforeAll(async () => {
    await mongoose.connect(envConfig.MONGO_URI, { dbName: envConfig.DB_NAME });
    await getAdminAllowedRequest().delete('/testing/all-data');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Should return 200 and empty blogs list', async () => {
    await getAdminAllowedRequest()
      .get('/users')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 0, totalCount: 0, items: [] });
  });

  it('Should return 404 for not existing blog', async () => {
    await getAdminAllowedRequest().get('/users/-99999999999999').expect(STATUS_HTTP.NOT_FOUND_404);
  });

  it('Should not be created with incorrect input data', async () => {
    await getAdminAllowedRequest().post('/users').send({}).expect(STATUS_HTTP.BAD_REQUEST_400);
    const { createResponse } = await UserTestManager.createUser(
      {
        email: 'EmailUncorrect',
        login: 'L',
        password: '123456789',
      },
      STATUS_HTTP.BAD_REQUEST_400
    );
    const errorsMessages = createResponse.body?.errorsMessages;
    expect(errorsMessages.length).toBe(2);

    await getAdminAllowedRequest()
      .get('/users')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 0, totalCount: 0, items: [] });
  });
  it('Should create user with correct input data', async () => {
    const { createdUser } = await UserTestManager.createUser({
      email: 'email@gm.com',
      login: 'Login',
      password: 'qwerty123',
    });
    if (createdUser) {
      user1 = createdUser;
    }

    await getAdminAllowedRequest()
      .get('/users')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 1, totalCount: 1, items: [user1] });
  });

  it('Should not create user with data which already exists', async () => {
    const { createResponse } = await UserTestManager.createUser(
      {
        email: 'email@gm.com',
        login: 'Login',
        password: 'qwerty123',
      },
      STATUS_HTTP.BAD_REQUEST_400
    );

    const expectedError: ErrorResponse = {
      errorsMessages: [
        { field: 'login', message: 'Login already in use' },
        { field: 'email', message: 'Email already in use' },
      ],
    };

    expect(createResponse.body).toEqual(expectedError);

    await getAdminAllowedRequest()
      .get('/users')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 1, totalCount: 1, items: [user1] });
  });

  it('Delete user with unexisted id', async () => {
    await getAdminAllowedRequest().delete(`/users/-99999999999999`).expect(STATUS_HTTP.NOT_FOUND_404);
    await getAdminAllowedRequest()
      .get('/users')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 1, totalCount: 1, items: [user1] });
  });

  it('Delete user with correct id', async () => {
    await getAdminAllowedRequest().delete(`/users/${user1.id}`).expect(STATUS_HTTP.NO_CONTENT_204);
    await getAdminAllowedRequest()
      .get('/users')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 0, totalCount: 0, items: [] });
  });

  it('search works correct', async () => {
    const { createdUser: createdUser2 } = await UserTestManager.createUser({
      email: 'user2@outlook.com',
      login: 'Login123',
      password: 'qwerty123',
    });

    const { createdUser: createdUser3 } = await UserTestManager.createUser({
      email: 'email3@gm.com',
      login: 'Login1234',
      password: 'qwerty123',
    });

    user2 = createdUser2!;
    user3 = createdUser3!;

    await getAdminAllowedRequest()
      .get('/users')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [user3, user2],
      });

    await getAdminAllowedRequest()
      .get('/users?searchEmailTerm=outlook')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 1,
        items: [user2],
      });

    await getAdminAllowedRequest()
      .get('/users?searchEmailTerm=il3&searchLoginTerm=Login123')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [user3, user2],
      });

    await getAdminAllowedRequest()
      .get('/users?searchLoginTerm=Login123&sortDirection=asc')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [user2, user3],
      });
  });
});
