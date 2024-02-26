import { STATUS_HTTP } from '../src/shared/types';
import { getAdminAllowedRequest, getRequest, getUserAuthorisedRequest } from './util/shared';

import { BlogTestManager } from './util/BlogTestManager';

import { ErrorResponse } from '../src/shared/types/Error';
import { PostInputModel, PostViewModel } from '../src/domain/posts/types/model/PostModels';
import { BlogInputModel, BlogViewModel } from '../src/domain/blogs/types/model/BlogModels';
import { UserTestManager } from './util/UserTestManager';
import { AuthTestManager } from './util/AuthTestManager';
import { ISO_STRING_REGEX } from '../src/shared/helpers/regex';
import { UserViewModel } from '../src/domain/users/types/model/UsersModels';
import mongoose from 'mongoose';
import { envConfig } from '../src/shared/helpers/env-config';

const blogInputCorrectData: BlogInputModel = {
  name: 'New blog',
  description: 'New description',
  websiteUrl: 'https://www.google.com/',
};

const postIncorrectInputData: PostInputModel = {
  blogId: '1233445656',
  title: '',
  content: 'Content',
  shortDescription: 'Descr',
};

const getUpdateCorrectPostData = (blogId: string): PostInputModel => {
  return {
    blogId,
    title: 'Updated Title',
    content: 'Updated Content',
    shortDescription: 'Updated Descr',
  };
};

const getPostCorrectInputData = (blogId: string): PostInputModel => {
  return {
    blogId,
    title: 'Title',
    content: 'Content',
    shortDescription: 'Descr',
  };
};

let post1: PostViewModel = {} as PostViewModel;
let post2: PostViewModel = {} as PostViewModel;
let user: UserViewModel = {} as UserViewModel;
let jwtToken = '';
describe('Posts', () => {
  beforeAll(async () => {
    await mongoose.connect(envConfig.MONGO_URI, { dbName: envConfig.DB_NAME });
    await getAdminAllowedRequest().delete('/testing/all-data');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Should return 200 and empty posts list with default pagination', async () => {
    await getAdminAllowedRequest().get('/posts').expect(STATUS_HTTP.OK_200, {
      pageSize: 10,
      page: 1,
      pagesCount: 0,
      totalCount: 0,
      items: [],
    });
  });

  it('Should return 404 for not existing post', async () => {
    await getAdminAllowedRequest().get('/posts/-99999999999999').expect(STATUS_HTTP.NOT_FOUND_404);
  });

  it('Should not be created with incorrect input data', async () => {
    await getAdminAllowedRequest().post('/posts').send(postIncorrectInputData).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getAdminAllowedRequest().post('/posts').send({}).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getAdminAllowedRequest().get('/posts').expect(STATUS_HTTP.OK_200, {
      pageSize: 10,
      page: 1,
      pagesCount: 0,
      totalCount: 0,
      items: [],
    });
  });
  it('Should create post with correct input data', async () => {
    const { createdBlog } = await BlogTestManager.createBlog(blogInputCorrectData);

    if (createdBlog) {
      const postResponse = await getAdminAllowedRequest().post('/posts').send(getPostCorrectInputData(createdBlog.id));
      post1 = postResponse.body;
    }

    await getAdminAllowedRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 1,
        items: [post1],
      });
  });
  it('Should create post for blog by endpoint /blogs/{blogId}/posts', async () => {
    const { createdBlog } = await BlogTestManager.createBlog(blogInputCorrectData);

    const { createdPost } = await BlogTestManager.createPostForBlog(createdBlog as BlogViewModel, {
      content: 'Second blog',
      title: 'Second blog Title',
      shortDescription: 'Second blog short description',
    });

    if (createdPost) {
      post2 = createdPost;
    }

    await getAdminAllowedRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [post2, post1],
      });

    await getAdminAllowedRequest()
      .get(`/blogs/${createdBlog!.id}/posts`)
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 1,
        items: [post2],
      });
  });
  it('Creating post for blog by endpoint /blogs/{blogId}/posts should return error body validations', async () => {
    const { createdBlog } = await BlogTestManager.createBlog(blogInputCorrectData);

    const { createResponse } = await BlogTestManager.createPostForBlog(
      createdBlog as BlogViewModel,
      {
        content: '',
        title: 'More than 30 symbols 123123 123123123123123123123123123123123123123123123',
        shortDescription: 'Second blog short description',
      },
      STATUS_HTTP.BAD_REQUEST_400
    );

    const expectedError: ErrorResponse = {
      errorsMessages: [
        { field: 'title', message: expect.any(String) },
        { field: 'content', message: expect.any(String) },
      ],
    };

    expect(createResponse.body).toEqual(expectedError);

    await getAdminAllowedRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [post2, post1],
      });
  });

  it('Should not create post for blog by endpoint /blogs/{blogId}/posts with not existed blogId', async () => {
    const unExistedBlog: BlogViewModel = {
      id: '-99999',
      name: 'Blog name',
      isMembership: true,
      createdAt: new Date().toISOString(),
      description: 'Desc',
      websiteUrl: 'https://www.google.com/',
    };

    const { createdPost } = await BlogTestManager.createPostForBlog(
      unExistedBlog as BlogViewModel,
      {
        content: 'Second blog',
        title: 'Second blog Title',
        shortDescription: 'Second blog short description',
      },
      STATUS_HTTP.NOT_FOUND_404
    );

    if (createdPost) {
      post2 = createdPost;
    }

    await getAdminAllowedRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [post2, post1],
      });
  });

  it('Should not update with incorrect input data', async () => {
    await getAdminAllowedRequest()
      .put(`/posts/${post1.id}`)
      .send(postIncorrectInputData)
      .expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Should update with correct input data', async () => {
    await getAdminAllowedRequest()
      .put(`/posts/${post1.id}`)
      .send(getUpdateCorrectPostData(post1.blogId))
      .expect(STATUS_HTTP.NO_CONTENT_204);

    post1 = { ...post1, ...getUpdateCorrectPostData(post1.blogId) };

    await getAdminAllowedRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [post2, post1],
      });
  });

  it('GET Sorting and filtering works correct', async () => {
    await getAdminAllowedRequest()
      .get('/posts?sortDirection=asc')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [post1, post2],
      });

    await getAdminAllowedRequest()
      .get('/posts?pageSize=1&pageNumber=2')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 1,
        page: 2,
        pagesCount: 2,
        totalCount: 2,
        items: [post1],
      });

    await getAdminAllowedRequest()
      .get('/posts?pageSize=1&pageNumber=2&sortDirection=asc')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 1,
        page: 2,
        pagesCount: 2,
        totalCount: 2,
        items: [post2],
      });

    await getAdminAllowedRequest()
      .get('/posts?pageSize=blabla&pageNumber=blabla&sortDirection=blabla&sortBy=unexistedName')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [post1, post2],
      });
  });

  it('Delete blog with unexisted id', async () => {
    await getAdminAllowedRequest().delete(`/posts/-99999999999999`).expect(STATUS_HTTP.NOT_FOUND_404);
    await getAdminAllowedRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [post2, post1],
      });
  });

  it('Delete blog with correct id', async () => {
    await getAdminAllowedRequest().delete(`/posts/${post1.id}`).expect(STATUS_HTTP.NO_CONTENT_204);
    await getAdminAllowedRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 1,
        items: [post2],
      });
  });

  it('post and get for posts by blogId /blogs/{blogId}/posts', async () => {
    const { createdBlog } = await BlogTestManager.createBlog(blogInputCorrectData);

    const createdPosts: PostViewModel[] = [];

    for (let i = 0; i < 4; i++) {
      const newPost = await BlogTestManager.createPostForBlog(createdBlog!, {
        title: 'Title' + i,
        content: 'Content' + i,
        shortDescription: 'Short desc' + i,
      });
      createdPosts.push(newPost.createdPost as PostViewModel);
    }

    await getAdminAllowedRequest()
      .get(`/blogs/${createdBlog!.id}/posts`)
      .expect(STATUS_HTTP.OK_200)
      .expect((res) => {
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items.length).toBe(4);
        expect(res.body.totalCount).toBe(4);
        expect(res.body.items).toEqual(expect.arrayContaining(createdPosts));
      });

    post1 = createdPosts[0];
    post2 = createdPosts[1];
  });

  it('Should not give create comment with bad data', async () => {
    await getRequest()
      .post(`/posts/-999999999/comments`)
      .send({ content: 'length 20 more valid string' })
      .expect(STATUS_HTTP.UNAUTHORIZED_401);

    const { createdUser } = await UserTestManager.createUser({
      email: 'Email@gm.com',
      login: 'Login',
      password: '123456789',
    });

    const { createdTokenResponse } = await AuthTestManager.login({
      loginOrEmail: createdUser!.email,
      password: '123456789',
    });

    user = createdUser!;
    jwtToken = createdTokenResponse!.accessToken;

    await getUserAuthorisedRequest(jwtToken)
      .post(`/posts/${post1.id}/comments`)
      .send({ content: '' })
      .expect(STATUS_HTTP.BAD_REQUEST_400);

    await getUserAuthorisedRequest(jwtToken)
      .post(`/posts/-999999999/comments`)
      .send({ content: 'length 20 more valid string' })
      .expect(STATUS_HTTP.NOT_FOUND_404);

    await getUserAuthorisedRequest(jwtToken)
      .post(`/posts/-999999999/comments`)
      .send({ content: 'length 19 not valid' })
      .expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Should create and save comment for post', async () => {
    const sentComments = ['What a great post! Correct length', 'Like it!! Correct length!!! Wow!!'];

    const getExpectedComment = (content: string) => {
      return {
        id: expect.any(String),
        content: content,
        commentatorInfo: {
          userId: user.id,
          userLogin: user.login,
        },
        createdAt: expect.stringMatching(ISO_STRING_REGEX),
      };
    };

    const response1 = await getUserAuthorisedRequest(jwtToken)
      .post(`/posts/${post1.id}/comments`)
      .send({ content: sentComments[0] })
      .expect(STATUS_HTTP.CREATED_201);

    expect(response1.body).toEqual(getExpectedComment(sentComments[0]));

    const response2 = await getUserAuthorisedRequest(jwtToken)
      .post(`/posts/${post1.id}/comments`)
      .send({ content: sentComments[1] })
      .expect(STATUS_HTTP.CREATED_201);

    expect(response2.body).toEqual(getExpectedComment(sentComments[1]));

    const getCommentsResponse = await getUserAuthorisedRequest(jwtToken)
      .get(`/posts/${post1.id}/comments`)
      .send({ content: sentComments[1] })
      .expect(STATUS_HTTP.OK_200);

    expect(getCommentsResponse.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: [getExpectedComment(sentComments[1]), getExpectedComment(sentComments[0])],
    });
  });
});
