import { STATUS_HTTP } from '../../src/shared/types';
import { getAdminAllowedRequest, SuperTestBodyResponse } from './shared';

import { ISO_STRING_REGEX } from '../../src/shared/helpers/regex';
import { BlogInputModel, BlogPostInputModel, BlogViewModel } from '../../src/domain/blogs/types/model/BlogModels';
import { PostViewModel } from '../../src/domain/posts/types/model/PostModels';
import { injectable } from 'inversify';
import { LIKE_STATUS } from '../../src/domain/likes/types/model/LikesModels';
@injectable()
export class BlogTestManagerClass {
  async createBlog(data: BlogInputModel, expectedStatus = STATUS_HTTP.CREATED_201) {
    const createResponse = await getAdminAllowedRequest().post('/blogs').send(data).expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.CREATED_201) {
      const successfulCreateResponse: SuperTestBodyResponse<BlogViewModel> = createResponse;
      const createdBlog = successfulCreateResponse?.body;

      expect(createdBlog).toEqual({
        id: expect.any(String),
        name: createdBlog.name,
        description: createdBlog.description,
        websiteUrl: createdBlog.websiteUrl,
        createdAt: expect.stringMatching(ISO_STRING_REGEX),
        isMembership: false,
      });

      return { createResponse: successfulCreateResponse, createdBlog };
    }

    return { createResponse };
  }
  async createPostForBlog(blog: BlogViewModel, data: BlogPostInputModel, expectedStatus = STATUS_HTTP.CREATED_201) {
    const createResponse = await getAdminAllowedRequest()
      .post(`/blogs/${blog.id}/posts`)
      .send(data)
      .expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.CREATED_201) {
      const successfulCreateResponse: SuperTestBodyResponse<PostViewModel> = createResponse;
      const createdPost = successfulCreateResponse?.body;

      expect(createdPost).toEqual({
        blogId: blog.id,
        title: data.title,
        createdAt: expect.stringMatching(ISO_STRING_REGEX),
        content: data.content,
        shortDescription: data.shortDescription,
        blogName: blog.name,
        id: expect.any(String),
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LIKE_STATUS.None,
          newestLikes: [],
        },
      });

      return { createResponse: successfulCreateResponse, createdPost: createdPost };
    }

    return { createResponse };
  }
}
