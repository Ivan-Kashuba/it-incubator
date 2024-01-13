import { describe } from 'node:test';
import { STATUS_HTTP } from '../src/shared/types';
import { getRequest } from './util/shared';
import { BlogInputModel, BlogViewModel } from '../src/features/blogs/types/model/BlogModels';
import { BlogTestManager } from './util/BlogTestManager';
import { ErrorResponse } from '../src/shared/types/Error';

const blogInputCorrectData: BlogInputModel = {
  name: 'New blog',
  description: 'New description',
  websiteUrl: 'https://www.google.com/',
};

const blogIncorrectInputData: BlogInputModel = {
  name: 'Correct name',
  description: '',
  websiteUrl: 'google.com',
};

describe('Blogs', () => {
  beforeAll(async () => {
    await getRequest().delete('/testing/all-data');
  });

  it('Should return 200 and empty blogs list', async () => {
    await getRequest().get('/blogs').expect(STATUS_HTTP.OK_200, []);
  });

  it('Should return 404 for not existing blog', async () => {
    await getRequest().get('/blogs/-99999999999999').expect(STATUS_HTTP.NOT_FOUND_404);
  });

  it('Should not be created with incorrect input data', async () => {
    await getRequest().post('/blogs').send(blogIncorrectInputData).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getRequest().post('/blogs').send({}).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getRequest().get('/blogs').expect(STATUS_HTTP.OK_200, []);
  });
  let firstBlog: BlogViewModel = {} as BlogViewModel;
  it('Should create blog with correct input data', async () => {
    const { createdBlog } = await BlogTestManager.createBlog(blogInputCorrectData);

    if (createdBlog) {
      firstBlog = createdBlog;
    }

    await getRequest().get('/blogs').expect(STATUS_HTTP.OK_200, [firstBlog]);
  });

  it('Should have only 1 error for one field even if it have few mistakes', async () => {
    const { createResponse } = await BlogTestManager.createBlog(blogIncorrectInputData, STATUS_HTTP.BAD_REQUEST_400);

    const expectedError: ErrorResponse = {
      errorsMessages: [
        { field: 'description', message: 'Description is required' },
        { field: 'websiteUrl', message: 'Do not match url pattern' },
      ],
    };

    expect(createResponse.body).toHaveProperty('errorsMessages');
    const errorsMessages = createResponse.body?.errorsMessages;
    expect(errorsMessages.length).toBe(2);
    expect(createResponse.body).toEqual(expectedError);

    await getRequest().get('/blogs').expect(STATUS_HTTP.OK_200, [firstBlog]);
  });

  it('Should not update with incorrect input data', async () => {
    await getRequest().put(`/blogs/${firstBlog.id}`).send(blogIncorrectInputData).expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Should update with correct input data', async () => {
    await getRequest().put(`/blogs/${firstBlog.id}`).send(blogInputCorrectData).expect(STATUS_HTTP.NO_CONTENT_204);
    await getRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, [{ ...firstBlog, ...blogInputCorrectData }]);
  });

  it('Delete blog with unexisted id', async () => {
    await getRequest().delete(`/blogs/-99999999999999`).expect(STATUS_HTTP.NOT_FOUND_404);
    await getRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, [{ ...firstBlog, ...blogInputCorrectData }]);
  });

  it('Delete blog with correct id', async () => {
    await getRequest().delete(`/blogs/${firstBlog.id}`).expect(STATUS_HTTP.NO_CONTENT_204);
    await getRequest().get('/blogs').expect(STATUS_HTTP.OK_200, []);
  });
});
