import { getAdminAllowedRequest, getRequest, getUserAuthorisedRequest } from './util/shared';
import { defaultUsersInputData } from './util/UserTestManager';
import { BlogViewModel } from '../src/domain/blogs/types/model/BlogModels';
import { PostViewModel } from '../src/domain/posts/types/model/PostModels';
import { STATUS_HTTP } from '../src/shared/types/index';
import { UserViewModel } from '../src/domain/users/types/model/UsersModels';
import { ISO_STRING_REGEX } from '../src/shared/helpers/regex';
import mongoose from 'mongoose';
import { envConfig } from '../src/shared/helpers/env-config';
import { LIKE_STATUS } from '../src/domain/likes/types/model/LikesModels';
import { ErrorResponse } from '../src/shared/types/Error';
import { AuthTestManager, BlogTestManager, PostTestManager } from '../src/composition-root';

const Symbols300Text =
  'Text 301 symbol Some text text Some text text Some text text Some text textSome text text Some text text Some text text Some text text Some text text Some text text Some text text Some text text Some text text Some text text Some text text Some text text Some text text Some text text Some text textt';

type TStartInfo = {
  token1: string;
  token2: string;
  blog1: BlogViewModel;
  post1: PostViewModel;
  user1: UserViewModel;
  user2: UserViewModel;
};

let startInfo: TStartInfo = {} as TStartInfo;

describe('Comments', () => {
  beforeAll(async () => {
    await mongoose.connect(envConfig.MONGO_URI, { dbName: envConfig.DB_NAME });
    await getAdminAllowedRequest().delete('/testing/all-data');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Preparing for next tests', async () => {
    const { accessToken: token1, createdUser: user1 } = await AuthTestManager.createUserAndLogin(
      defaultUsersInputData[0]
    );
    const { accessToken: token2, createdUser: user2 } = await AuthTestManager.createUserAndLogin(
      defaultUsersInputData[1]
    );

    const { createdBlog: blog1 } = await BlogTestManager.createBlog({
      name: 'Blog1',
      websiteUrl: 'https://samurai.it-incubator.io',
      description: 'Some description text text text text text ',
    });

    const { createdPost: post1 } = await PostTestManager.createPost({
      blogId: blog1!.id,
      title: 'Some title',
      content: 'Content length 20 more is valid text text',
      shortDescription: 'Short description',
    });

    startInfo = {
      token1: token1!,
      token2: token2!,
      blog1: blog1!,
      post1: post1!,
      user1: user1!,
      user2: user2!,
    };
  });

  it('Get comments for post without auth', async () => {
    await getRequest()
      .get(`/posts/${startInfo.post1.id}/comments`)
      .expect(STATUS_HTTP.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
  });

  it('Do not create comment if data is invalid', async () => {
    const { token1, post1 } = startInfo;

    await getUserAuthorisedRequest('Bearer fake.token')
      .post(`/posts/${post1.id}/comments`)
      .send({
        content: '',
      })
      .expect(STATUS_HTTP.UNAUTHORIZED_401);

    await getUserAuthorisedRequest(token1)
      .post(`/posts/${post1.id}/comments`)
      .send({
        content: '',
      })
      .expect(STATUS_HTTP.BAD_REQUEST_400);

    await getUserAuthorisedRequest(token1)
      .post(`/posts/${post1.id}/comments`)
      .send({
        content: 'Length less than 20',
      })
      .expect(STATUS_HTTP.BAD_REQUEST_400);

    await getUserAuthorisedRequest(token1)
      .post(`/posts/${post1.id}/comments`)
      .send({
        content: Symbols300Text + 'Q',
      })
      .expect(STATUS_HTTP.BAD_REQUEST_400);
  });

  it('Create and update comment for post successfully', async () => {
    const { user1, token1, post1, token2 } = startInfo;

    const { createdComment: comment1User1 } = await PostTestManager.createCommentForPost(post1.id, token1, {
      content: 'Some correct length 20 more string text text1',
    });

    const { createdComment: comment2User1 } = await PostTestManager.createCommentForPost(post1.id, token1, {
      content: 'Some correct length 20 more string text text2',
    });

    const { createdComment: comment3User2 } = await PostTestManager.createCommentForPost(post1.id, token2, {
      content: 'Some correct length 20 more string text text3',
    });

    const { createdComment: comment4User2 } = await PostTestManager.createCommentForPost(post1.id, token2, {
      content: 'Some correct length 20 more string text text4',
    });

    await getUserAuthorisedRequest(token1)
      .put(`/comments/${comment1User1!.id}`)
      .send({ content: 'Some correct length 20 more modified' })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const getComment1Response = await getRequest().get(`/comments/${comment1User1!.id}`).expect(STATUS_HTTP.OK_200);

    expect(getComment1Response.body).toEqual({
      id: comment1User1!.id,
      content: 'Some correct length 20 more modified',
      commentatorInfo: {
        userId: user1.id,
        userLogin: user1.login,
      },
      createdAt: expect.stringMatching(ISO_STRING_REGEX),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LIKE_STATUS.None,
      },
    });

    await getRequest()
      .get(`/posts/${post1.id}/comments`)
      .expect(STATUS_HTTP.OK_200, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: [
          comment4User2,
          comment3User2,
          comment2User1,
          { ...comment1User1, content: 'Some correct length 20 more modified' },
        ],
      });
  });
  it('Do not let edit or delete comment if it not belong to user, do only for own comment', async () => {
    const { token1, post1, token2 } = startInfo;

    const { createdComment: comment1User1 } = await PostTestManager.createCommentForPost(post1.id, token1, {
      content: 'Some correct length 20 more string text text1',
    });

    const { createdComment: comment2User2 } = await PostTestManager.createCommentForPost(post1.id, token2, {
      content: 'Some correct length 20 more string text text2',
    });

    getUserAuthorisedRequest(token2).delete(`/comments/${comment1User1!.id}`).expect(STATUS_HTTP.FORBIDDEN_403);
    getUserAuthorisedRequest(token2)
      .put(`/comments/${comment1User1!.id}`)
      .send({ content: 'Some valid massage length more than 20 symbols' })
      .expect(STATUS_HTTP.FORBIDDEN_403);

    getUserAuthorisedRequest(token1).put(`/comments/${comment2User2!.id}`).expect(STATUS_HTTP.FORBIDDEN_403);
    getUserAuthorisedRequest(token1)
      .delete(`/comments/${comment2User2!.id}`)
      .send({ content: 'Some valid massage length more than 20 symbols' })
      .expect(STATUS_HTTP.FORBIDDEN_403);

    getUserAuthorisedRequest(token1)
      .put(`/comments/${comment1User1!.id}`)
      .send({ content: 'Some valid massage length more than 20 symbols' })
      .expect(STATUS_HTTP.NO_CONTENT_204);
    getUserAuthorisedRequest(token1).delete(`/comments/${comment1User1!.id}`).expect(STATUS_HTTP.NO_CONTENT_204);
  });
  it('Like comments works check', async () => {
    const { token1, token2, post1 } = startInfo;

    const { createdComment: comment } = await PostTestManager.createCommentForPost(post1.id, token1, {
      content: 'Some correct length 20 more string text text1',
    });

    const expectedErrorBadLikeStatus: ErrorResponse = {
      errorsMessages: [
        {
          message: 'Bad like status enum value',
          field: 'likeStatus',
        },
      ],
    };

    await getUserAuthorisedRequest(token1)
      .put(`/comments/${comment!.id}/like-status`)
      .send({ likeStatus: 'Invalid enum value' })
      .expect(STATUS_HTTP.BAD_REQUEST_400, expectedErrorBadLikeStatus);

    const expectedErrorNoFoundCommentForLike: ErrorResponse = {
      errorsMessages: [
        {
          field: 'commentId',
          message: 'Comment is not exist',
        },
      ],
    };

    await getUserAuthorisedRequest(token1)
      .put(`/comments/-999999999999999999999/like-status`)
      .send({ likeStatus: LIKE_STATUS.Like })
      .expect(STATUS_HTTP.NOT_FOUND_404, expectedErrorNoFoundCommentForLike);

    await getUserAuthorisedRequest(token1)
      .put(`/comments/${comment!.id}/like-status`)
      .send({ likeStatus: LIKE_STATUS.Like })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const commentByUser1ViewResponse = await getUserAuthorisedRequest(token1)
      .get(`/comments/${comment!.id}`)
      .expect(STATUS_HTTP.OK_200);

    const commentByUser2ViewResponse = await getUserAuthorisedRequest(token2)
      .get(`/comments/${comment!.id}`)
      .expect(STATUS_HTTP.OK_200);

    expect(commentByUser1ViewResponse.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LIKE_STATUS.Like,
    });

    expect(commentByUser2ViewResponse.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LIKE_STATUS.None,
    });

    await getUserAuthorisedRequest(token2)
      .put(`/comments/${comment!.id}/like-status`)
      .send({ likeStatus: LIKE_STATUS.Like })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const commentByUser2ViewAfterOwnLikeResponse = await getUserAuthorisedRequest(token2)
      .get(`/comments/${comment!.id}`)
      .expect(STATUS_HTTP.OK_200);

    expect(commentByUser2ViewAfterOwnLikeResponse.body.likesInfo).toEqual({
      likesCount: 2,
      dislikesCount: 0,
      myStatus: LIKE_STATUS.Like,
    });

    await getUserAuthorisedRequest(token2)
      .put(`/comments/${comment!.id}/like-status`)
      .send({ likeStatus: LIKE_STATUS.Dislike })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const commentByUser2ViewAfterDislike = await getUserAuthorisedRequest(token2)
      .get(`/comments/${comment!.id}`)
      .expect(STATUS_HTTP.OK_200);

    expect(commentByUser2ViewAfterDislike.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 1,
      myStatus: LIKE_STATUS.Dislike,
    });

    await getUserAuthorisedRequest(token2)
      .put(`/comments/${comment!.id}/like-status`)
      .send({ likeStatus: LIKE_STATUS.None })
      .expect(STATUS_HTTP.NO_CONTENT_204);

    const commentByUser2ViewAfterNoneStatus = await getUserAuthorisedRequest(token2)
      .get(`/comments/${comment!.id}`)
      .expect(STATUS_HTTP.OK_200);

    expect(commentByUser2ViewAfterNoneStatus.body.likesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 0,
      myStatus: LIKE_STATUS.None,
    });
  });
});
