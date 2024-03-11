import { STATUS_HTTP } from '../src/shared/types';
import { getAdminAllowedRequest } from './util/shared';
import { ErrorResponse } from '../src/shared/types/Error';
import { BlogInputModel, BlogViewModel } from '../src/domain/blogs/types/model/BlogModels';
import mongoose from 'mongoose';
import { envConfig } from '../src/shared/helpers/env-config';
import { BlogTestManager } from '../src/composition-root';

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

let firstBlog: BlogViewModel = {} as BlogViewModel;
let blog1: BlogViewModel = {} as BlogViewModel;
let blog2: BlogViewModel = {} as BlogViewModel;
let blog3: BlogViewModel = {} as BlogViewModel;

describe('Blogs', () => {
  beforeAll(async () => {
    await mongoose.connect(envConfig.MONGO_URI, { dbName: envConfig.DB_NAME });
    await getAdminAllowedRequest().delete('/testing/all-data');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Should return 200 and empty blogs list', async () => {
    await getAdminAllowedRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 0, totalCount: 0, items: [] });
  });

  it('Should return 404 for not existing blog', async () => {
    await getAdminAllowedRequest().get('/blogs/-99999999999999').expect(STATUS_HTTP.NOT_FOUND_404);
  });

  it('Should not be created with incorrect input data', async () => {
    await getAdminAllowedRequest().post('/blogs').send(blogIncorrectInputData).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getAdminAllowedRequest().post('/blogs').send({}).expect(STATUS_HTTP.BAD_REQUEST_400);
    await getAdminAllowedRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 0, totalCount: 0, items: [] });
  });
  it('Should create blog with correct input data', async () => {
    const { createdBlog } = await BlogTestManager.createBlog(blogInputCorrectData);

    if (createdBlog) {
      firstBlog = createdBlog;
    }

    await getAdminAllowedRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 1, totalCount: 1, items: [firstBlog] });
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

    await getAdminAllowedRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 1, totalCount: 1, items: [firstBlog] });
  });

  it('Should not update with incorrect input data', async () => {
    await getAdminAllowedRequest()
      .put(`/blogs/${firstBlog.id}`)
      .send(blogIncorrectInputData)
      .expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Should update with correct input data', async () => {
    await getAdminAllowedRequest()
      .put(`/blogs/${firstBlog.id}`)
      .send(blogInputCorrectData)
      .expect(STATUS_HTTP.NO_CONTENT_204);
    firstBlog = { ...firstBlog, ...blogInputCorrectData };
    await getAdminAllowedRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 1, totalCount: 1, items: [firstBlog] });
  });

  it('Delete blog with unexisted id', async () => {
    await getAdminAllowedRequest().delete(`/blogs/-99999999999999`).expect(STATUS_HTTP.NOT_FOUND_404);
    await getAdminAllowedRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 1, totalCount: 1, items: [firstBlog] });
  });

  it('Delete blog with correct id', async () => {
    await getAdminAllowedRequest().delete(`/blogs/${firstBlog.id}`).expect(STATUS_HTTP.NO_CONTENT_204);
    await getAdminAllowedRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, { pageSize: 10, page: 1, pagesCount: 0, totalCount: 0, items: [] });
  });

  it('searchNameTerm works correct', async () => {
    const { createdBlog: createdBlog1 } = await BlogTestManager.createBlog({ ...blogInputCorrectData, name: 'Blog1' });
    const { createdBlog: createdBlog2 } = await BlogTestManager.createBlog({ ...blogInputCorrectData, name: 'Blog2' });
    const { createdBlog: createdBlog3 } = await BlogTestManager.createBlog({ ...blogInputCorrectData, name: 'Name 3' });

    blog1 = createdBlog1!;
    blog2 = createdBlog2!;
    blog3 = createdBlog3!;

    await getAdminAllowedRequest()
      .get('/blogs')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 3,
        items: [blog3, blog2, blog1],
      });

    await getAdminAllowedRequest()
      .get('/blogs?searchNameTerm=blog')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [blog2, blog1],
      });

    await getAdminAllowedRequest()
      .get('/blogs?searchNameTerm=blog1')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 1,
        items: [blog1],
      });
  });

  it('Sorting and filtering works correct', async () => {
    await getAdminAllowedRequest()
      .get('/blogs?pageSize=2')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 2,
        page: 1,
        pagesCount: 2,
        totalCount: 3,
        items: [blog3, blog2],
      });

    await getAdminAllowedRequest()
      .get('/blogs?searchNameTerm=blog&pageNumber=1')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 2,
        items: [blog2, blog1],
      });
    await getAdminAllowedRequest()
      .get('/blogs?searchNameTerm=blog&pageNumber=1&pageSize=1')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 1,
        page: 1,
        pagesCount: 2,
        totalCount: 2,
        items: [blog2],
      });

    await getAdminAllowedRequest()
      .get('/blogs?searchNameTerm=blog1')
      .expect(STATUS_HTTP.OK_200, {
        pageSize: 10,
        page: 1,
        pagesCount: 1,
        totalCount: 1,
        items: [blog1],
      });
  });
});
