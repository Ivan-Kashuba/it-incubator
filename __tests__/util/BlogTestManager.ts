import { STATUS_HTTP } from '../../src/shared/types';
import { getRequest, SuperTestBodyResponse } from './shared';
import { BlogInputModel, BlogViewModel } from '../../src/features/blogs/types/model/BlogModels';
import { ISO_STRING } from '../../src/shared/helpers/regex';

export class BlogTestManagerClass {
  async createBlog(data: BlogInputModel, expectedStatus = STATUS_HTTP.CREATED_201) {
    const createResponse = await getRequest().post('/blogs').send(data).expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.CREATED_201) {
      const successfulCreateResponse: SuperTestBodyResponse<BlogViewModel> = createResponse;
      const createdBlog = successfulCreateResponse?.body;

      expect(createdBlog).toEqual({
        _id: expect.any(String),
        id: expect.any(String),
        name: createdBlog.name,
        description: createdBlog.description,
        websiteUrl: createdBlog.websiteUrl,
        createdAt: expect.stringMatching(ISO_STRING),
        isMembership: true,
      });

      return { createResponse: successfulCreateResponse, createdBlog };
    }

    return { createResponse };
  }
}

export const BlogTestManager = new BlogTestManagerClass();
