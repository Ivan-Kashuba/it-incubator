import { STATUS_HTTP } from '../../src/shared/types';
import { getRequest, SuperTestBodyResponse } from './shared';
import { BlogInputModel, BlogViewModel } from '../../src/features/blogs/types/model/BlogViewModel';
import { success } from 'concurrently/dist/src/defaults';
import { ExpressErrorType } from '../types/shared';

export class BlogTestManagerClass {
  async createBlog(data: BlogInputModel, expectedStatus = STATUS_HTTP.CREATED_201) {
    const createResponse = await getRequest().post('/blogs').send(data).expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.CREATED_201) {
      const successfulCreateResponse: SuperTestBodyResponse<BlogViewModel> = createResponse;
      const createdBlog = successfulCreateResponse?.body;

      expect(createdBlog).toEqual({
        id: expect.any(String),
        name: createdBlog.name,
        description: createdBlog.description,
        websiteUrl: createdBlog.websiteUrl,
      });

      return { createResponse: successfulCreateResponse, createdBlog };
    }

    return { createResponse };
  }
}

export const BlogTestManager = new BlogTestManagerClass();
