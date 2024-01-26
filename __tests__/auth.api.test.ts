import { getAdminAllowedRequest, getRequest, getUserAuthorisedRequest } from './util/shared';
import { STATUS_HTTP } from '../src/shared/types/index';
import { UserTestManager } from './util/UserTestManager';
import { UserCreateModel, UserViewModel } from '../src/domain/users/types/model/UsersModels';

const userCredentials1: UserCreateModel = { email: 'user1email@gm.com', login: 'User1', password: '123456789' };
let user1: UserViewModel = {} as UserViewModel;
let jwtTokenUser1 = '';

const userCredentials2: UserCreateModel = { email: 'user2email@gm.com', login: 'User2', password: '123456789' };
let user2: UserViewModel = {} as UserViewModel;
let jwtTokenUser2 = '';

describe('Auth', () => {
  beforeAll(async () => {
    await getRequest().delete('/testing/all-data');
  });

  it('Should return 400 if bad validation', async () => {
    await getRequest()
      .post('/auth/login')
      .send({
        loginOrEmail: '',
        password: '',
      })
      .expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Should login user by email and username', async () => {
    const { createdUser: createdUser1 } = await UserTestManager.createUser(userCredentials1);
    const { createdUser: createdUser2 } = await UserTestManager.createUser(userCredentials2);
    user1 = createdUser1!;
    user2 = createdUser2!;

    const response1 = await getRequest()
      .post('/auth/login')
      .send({ loginOrEmail: userCredentials1.login, password: userCredentials1.password })
      .expect(STATUS_HTTP.OK_200);

    expect(response1.body).toEqual({
      accessToken: expect.any(String),
    });

    const response2 = await getRequest()
      .post('/auth/login')
      .send({ loginOrEmail: userCredentials1.email, password: userCredentials1.password })
      .expect(STATUS_HTTP.OK_200);
    expect(response1.body).toEqual({
      accessToken: expect.any(String),
    });

    const response3 = await getRequest()
      .post('/auth/login')
      .send({ loginOrEmail: userCredentials2.email, password: userCredentials2.password })
      .expect(STATUS_HTTP.OK_200);
    expect(response1.body).toEqual({
      accessToken: expect.any(String),
    });

    expect(response2.body).toEqual({
      accessToken: expect.any(String),
    });

    jwtTokenUser1 = response2.body.accessToken;
    jwtTokenUser2 = response3.body.accessToken;
  });

  it('Should return 401 if bad credentials', async () => {
    await getRequest()
      .post('/auth/login')
      .send({
        loginOrEmail: 'Unexisted user',
        password: 'Some password',
      })
      .expect(STATUS_HTTP.UNAUTHORIZED_401);

    await getAdminAllowedRequest()
      .post('/auth/login')
      .send({ loginOrEmail: userCredentials1.email, password: userCredentials1.password + 1 })
      .expect(STATUS_HTTP.UNAUTHORIZED_401);
  });

  it('Should not return me user info if token is not valid', async () => {
    await getUserAuthorisedRequest('Bearer owfhnwdoifwdfwdf.wdfwdfwdf.wdfwdf')
      .get('/auth/me')
      .expect(STATUS_HTTP.UNAUTHORIZED_401);
  });

  it('Should return me user info if token valid', async () => {
    await getUserAuthorisedRequest(jwtTokenUser1).get('/auth/me').expect(STATUS_HTTP.OK_200, {
      userId: user1.id,
      email: userCredentials1.email,
      login: userCredentials1.login,
    });

    await getUserAuthorisedRequest(jwtTokenUser2).get('/auth/me').expect(STATUS_HTTP.OK_200, {
      userId: user2.id,
      email: userCredentials2.email,
      login: userCredentials2.login,
    });
  });
});
