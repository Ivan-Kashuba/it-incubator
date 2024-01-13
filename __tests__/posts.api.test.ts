import { describe } from 'node:test';
import { STATUS_HTTP } from '../src/shared/types';
import { getRequest } from './util/shared';
import { BlogInputModel } from '../src/features/blogs/types/model/BlogModels';
import { BlogTestManager } from './util/BlogTestManager';
import { PostInputModel, PostViewModel } from '../src/features/posts/types/model/PostModels';

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
  let post1: PostViewModel = {} as PostViewModel;
  it('Should create post with correct input data', async () => {
    const { createdBlog } = await BlogTestManager.createBlog(blogInputCorrectData);

    if (createdBlog) {
      const postResponse = await getRequest().post('/posts').send(getPostCorrectInputData(createdBlog.id));
      console.log('postResponse:', postResponse);
      post1 = postResponse.body;
    }

    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, [post1]);
  });

  it('Should not update with incorrect input data', async () => {
    await getRequest().put(`/posts/${post1.id}`).send(postIncorrectInputData).expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Should update with correct input data', async () => {
    await getRequest()
      .put(`/posts/${post1.id}`)
      .send(getUpdateCorrectPostData(post1.blogId))
      .expect(STATUS_HTTP.NO_CONTENT_204);

    await getRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, [{ ...post1, ...getUpdateCorrectPostData(post1.blogId) }]);
  });

  it('Delete blog with unexisted id', async () => {
    await getRequest().delete(`/posts/-99999999999999`).expect(STATUS_HTTP.NOT_FOUND_404);
    await getRequest()
      .get('/posts')
      .expect(STATUS_HTTP.OK_200, [{ ...post1, ...getUpdateCorrectPostData(post1.blogId) }]);
  });

  it('Delete blog with correct id', async () => {
    await getRequest().delete(`/posts/${post1.id}`).expect(STATUS_HTTP.NO_CONTENT_204);
    await getRequest().get('/posts').expect(STATUS_HTTP.OK_200, []);
  });
});
