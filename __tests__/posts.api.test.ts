import { describe } from 'node:test';
import { STATUS_HTTP } from '../src/shared/types';
import { getRequest } from './util/shared';
import { BlogInputModel, BlogViewModel } from '../src/features/blogs/types/model/BlogModels';
import { BlogTestManager } from './util/BlogTestManager';
import { PostInputModel, PostViewModel } from '../src/features/posts/types/model/PostModels';
import { ErrorResponse } from '../src/shared/types/Error';

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
describe('Posts', () => {
  beforeAll(async () => {
    await getRequest().delete('/testing/all-data');
  });

  it('Should return 200 and empty blogs list', async () => {
    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, []);
  });

  it('Should return 404 for not existing blog', async () => {
    await getRequest().get('/posts/-99999999999999').expect(STATUS_HTTP.NOT_FOUND_404);
  });

  it('Should not be created with incorrect input data', async () => {
    await getRequest().post('/posts').send(postIncorrectInputData).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getRequest().post('/posts').send({}).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, []);
  });
  it('Should create post with correct input data', async () => {
    const { createdBlog } = await BlogTestManager.createBlog(blogInputCorrectData);

    if (createdBlog) {
      const postResponse = await getRequest().post('/posts').send(getPostCorrectInputData(createdBlog.id));
      post1 = postResponse.body;
    }

    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, [post1]);
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

    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, [post1, post2]);
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

    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, [post1, post2]);
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
      STATUS_HTTP.BAD_REQUEST_400
    );

    if (createdPost) {
      post2 = createdPost;
    }

    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, [post1, post2]);
  });

  it('Should not update with incorrect input data', async () => {
    await getRequest().put(`/posts/${post1.id}`).send(postIncorrectInputData).expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Should update with correct input data', async () => {
    await getRequest()
      .put(`/posts/${post1.id}`)
      .send(getUpdateCorrectPostData(post1.blogId))
      .expect(STATUS_HTTP.NO_CONTENT_204);

    post1 = { ...post1, ...getUpdateCorrectPostData(post1.blogId) };

    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, [post1, post2]);
  });

  it('Delete blog with unexisted id', async () => {
    await getRequest().delete(`/posts/-99999999999999`).expect(STATUS_HTTP.NOT_FOUND_404);
    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, [post1, post2]);
  });

  it('Delete blog with correct id', async () => {
    await getRequest().delete(`/posts/${post1.id}`).expect(STATUS_HTTP.NO_CONTENT_204);
    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, [post2]);
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

    await getRequest()
      .get(`/blogs/${createdBlog!.id}/posts`)
      .expect(STATUS_HTTP.OK_200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(4);
        expect(res.body).toEqual(expect.arrayContaining(createdPosts));
      });
  });
});
