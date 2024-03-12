import { getAdminAllowedRequest, getRequest, getUserAuthorisedRequest } from './util/shared';
import { STATUS_HTTP } from '../src/shared/types/index';
import { UserCreateModel, UserViewModel } from '../src/domain/users/types/model/UsersModels';
import { ErrorResponse } from '../src/shared/types/Error';
import { usersRepository } from '../src/repositories/users-repository';
import { add } from 'date-fns';
import { ISO_STRING_REGEX } from '../src/shared/helpers/regex';
import { ObjectId } from 'mongodb';
import { emailManager } from '../src/adapters/emailAdapter';
import { delay } from './util/delay';
import mongoose from 'mongoose';
import { envConfig } from '../src/shared/helpers/env-config';
import { AuthTestManager, UserTestManager } from './index';

const userCredentials1: UserCreateModel = { email: 'user1email@gm.com', login: 'User1', password: '123456789' };
const userCredentials2: UserCreateModel = { email: 'user2email@gm.com', login: 'User2', password: '123456789' };

type TExpectState = {
  user1: UserViewModel;
  jwtTokenUser1: string;

  user2: UserViewModel;
  jwtTokenUser2: string;

  confirmationCode: string;
};

let expectedState: Partial<TExpectState> = {};

describe('Auth', () => {
  beforeAll(async () => {
    await mongoose.connect(envConfig.MONGO_URI, { dbName: envConfig.DB_NAME });
    await getAdminAllowedRequest().delete('/testing/all-data');
    jest.spyOn(emailManager, 'sendRegistrationConfirmEmail').mockReturnValue(Promise.resolve(true));
  });

  afterAll(async () => {
    await mongoose.connection.close();
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

    expectedState = {
      ...expectedState,
      user1: createdUser1,
      user2: createdUser2,
      jwtTokenUser1: response2.body.accessToken,
      jwtTokenUser2: response3.body.accessToken,
    };
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
      .expect(STATUS_HTTP.TOO_MANY_REQUESTS_429);

    await delay(10000);

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
    const { jwtTokenUser1, user1, user2, jwtTokenUser2 } = expectedState as TExpectState;

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

  it('register user with bad credentials', async () => {
    const expectedError: ErrorResponse = {
      errorsMessages: [
        { field: 'login', message: expect.any(String) },
        { field: 'email', message: expect.any(String) },
        { field: 'password', message: expect.any(String) },
      ],
    };

    await getRequest()
      .post('/auth/registration')
      .send({ login: 'Lg', email: 'email@gm', password: 'pswrd' })
      .expect(STATUS_HTTP.BAD_REQUEST_400)
      .expect((res) => {
        expect(res.body).toEqual(expectedError);
      });
  });

  it('register user with correct credentials', async () => {
    await getRequest()
      .post('/auth/registration')
      .send({ login: 'login', email: 'email1@gm.com', password: 'password123' })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const userInDb = await usersRepository.findUserByLoginOrEmail('email1@gm.com');

    expectedState.confirmationCode = userInDb!.accountConfirmation!.confirmationCode!;

    expect(userInDb).toEqual({
      id: expect.any(String),
      _id: expect.any(ObjectId),
      accountConfirmation: {
        isConfirmed: false,
        confirmationCode: expect.any(String),
        expirationDate: add(userInDb!.accountData.createdAt, { hours: 24 }).toISOString(),
      },
      accountData: {
        email: 'email1@gm.com',
        createdAt: expect.stringMatching(ISO_STRING_REGEX),
        login: 'login',
        salt: expect.any(String),
        hash: expect.any(String),
      },
      passwordRecovery: {
        confirmationCode: null,
        expirationDate: null,
      },
      __v: 0,
    });
  });
  it('Resending registration email with code with errors', async () => {
    // confirm email for user
    await getRequest()
      .post('/auth/registration-confirmation')
      .send({ code: expectedState.confirmationCode })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    await getRequest()
      .post('/auth/registration-email-resending')
      .send({ email: 'not-existed-email@gm.com' })
      .expect(STATUS_HTTP.BAD_REQUEST_400);

    // trying to confirm already confirmed user
    await getRequest()
      .post('/auth/registration-email-resending')
      .send({ email: 'email1@gm.com' })
      .expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Successfully registration flow', async () => {
    await getRequest()
      .post('/auth/registration')
      .send({ login: 'userLogin', email: 'user-email@gm.com', password: 'password123' })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const initialUser = await usersRepository.findUserByLoginOrEmail('userLogin');

    await getRequest()
      .post('/auth/registration-email-resending')
      .send({ email: 'user-email@gm.com' })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const userWithUpdatedConfirmationCode = await usersRepository.findUserByLoginOrEmail('userLogin');

    expect(initialUser!.accountConfirmation.confirmationCode).not.toBe(
      userWithUpdatedConfirmationCode!.accountConfirmation.confirmationCode
    );
    expect(initialUser!.accountConfirmation.confirmationCode).toBe(initialUser!.accountConfirmation.confirmationCode);

    await getRequest()
      .post('/auth/registration-confirmation')
      .send({ code: userWithUpdatedConfirmationCode!.accountConfirmation.confirmationCode })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const userAfterConfirm = await usersRepository.findUserByLoginOrEmail('userLogin');

    expect(userAfterConfirm).toEqual({
      id: expect.any(String),
      _id: expect.any(ObjectId),
      accountConfirmation: {
        isConfirmed: true,
        confirmationCode: null,
        expirationDate: null,
      },
      accountData: {
        email: 'user-email@gm.com',
        createdAt: expect.stringMatching(ISO_STRING_REGEX),
        login: 'userLogin',
        salt: expect.any(String),
        hash: expect.any(String),
      },
      passwordRecovery: {
        confirmationCode: null,
        expirationDate: null,
      },
      __v: 0,
    });
  });
  it('Logout & refresh token flow', async () => {
    const { accessToken, refreshToken } = await AuthTestManager.createUserAndLogin({
      email: 'Email1@gm.com',
      login: 'Login1',
      password: '12345678',
    });

    await getRequest().post('/auth/logout').expect(STATUS_HTTP.UNAUTHORIZED_401);
    await getUserAuthorisedRequest(accessToken).post('/auth/logout').expect(STATUS_HTTP.UNAUTHORIZED_401);
    await getUserAuthorisedRequest(accessToken, refreshToken!).post('/auth/logout').expect(STATUS_HTTP.NO_CONTENT_204);
    await getUserAuthorisedRequest(accessToken, refreshToken!)
      .post('/auth/refresh-token')
      .expect(STATUS_HTTP.UNAUTHORIZED_401);
    await getUserAuthorisedRequest(accessToken, refreshToken!)
      .post('/auth/logout')
      .expect(STATUS_HTTP.UNAUTHORIZED_401);

    await delay(1000);

    const { createdTokenResponse, refreshToken: refreshToken1 } = await AuthTestManager.login({
      loginOrEmail: 'Email1@gm.com',
      password: '12345678',
    });

    await delay(1000);
    const response1 = await getUserAuthorisedRequest(createdTokenResponse!.accessToken, refreshToken1!)
      .post('/auth/refresh-token')
      .expect(STATUS_HTTP.OK_200);

    await getUserAuthorisedRequest(createdTokenResponse!.accessToken, refreshToken1!)
      .post('/auth/logout')
      .expect(STATUS_HTTP.UNAUTHORIZED_401);

    await getUserAuthorisedRequest(response1.body.accessToken, AuthTestManager.getRefreshTokenByResponse(response1)!)
      .post('/auth/logout')
      .expect(STATUS_HTTP.NO_CONTENT_204);
  });
});
