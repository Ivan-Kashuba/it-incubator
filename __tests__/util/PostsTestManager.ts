import { STATUS_HTTP } from '../../src/shared/types';
import { getAdminAllowedRequest, getUserAuthorisedRequest, SuperTestBodyResponse } from './shared';

import { ISO_STRING_REGEX } from '../../src/shared/helpers/regex';
import { PostInputModel, PostViewModel } from '../../src/domain/posts/types/model/PostModels';
import { blogsRepository } from '../../src/repositories/blogs-repository';
import { CommentInputModel } from '../../src/domain/comments/types/model/CommentsModels';
import { LIKE_STATUS } from '../../src/domain/likes/types/model/LikesModels';

export class PostTestManagerClass {
  async createPost(data: PostInputModel, expectedStatus = STATUS_HTTP.CREATED_201) {
    const createResponse = await getAdminAllowedRequest().post('/posts').send(data).expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.CREATED_201) {
      const successfulCreateResponse: SuperTestBodyResponse<PostViewModel> = createResponse;
      const createdPost = successfulCreateResponse?.body;

      const blog = await blogsRepository.findBlogById(data.blogId);

      expect(createdPost).toEqual({
        id: expect.any(String),
        blogName: blog!.name,
        title: data.title,
        content: data.content,
        shortDescription: data.shortDescription,
        createdAt: expect.stringMatching(ISO_STRING_REGEX),
        blogId: data.blogId,
      });

      return { createResponse: successfulCreateResponse, createdPost };
    }

    return { createResponse };
  }

  async createCommentForPost(
    postId: string,
    jwtToken: string,
    data: CommentInputModel,
    expectedStatus = STATUS_HTTP.CREATED_201
  ) {
    const createResponse = await getUserAuthorisedRequest(jwtToken)
      .post(`/posts/${postId}/comments`)
      .send(data)
      .expect(expectedStatus);

    if (expectedStatus === STATUS_HTTP.CREATED_201) {
      const successfulCreateResponse: SuperTestBodyResponse<PostViewModel> = createResponse;
      const createdComment = successfulCreateResponse?.body;

      expect(createdComment).toEqual({
        id: expect.any(String),
        content: data.content,
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: expect.any(String),
        },
        createdAt: expect.stringMatching(ISO_STRING_REGEX),
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LIKE_STATUS.None,
        },
      });

      return { createResponse: successfulCreateResponse, createdComment };
    }

    return { createResponse };
  }
}

export const PostTestManager = new PostTestManagerClass();
