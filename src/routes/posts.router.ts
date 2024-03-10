import express, { Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
  STATUS_HTTP,
} from '../shared/types';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { adminAuthCheckMiddleware } from '../middlewares/adminAuthCheckMiddleware';

import { PaginationPayload, WithPagination } from '../shared/types/Pagination';
import { validatePayloadPagination } from '../shared/helpers/pagination';
import { PostInputModel, PostViewModel } from '../domain/posts/types/model/PostModels';
import { postsService } from '../domain/posts/services/posts-service';
import { postInputModelValidation } from '../domain/posts/validation/postInputModelValidation';
import { postsRepository } from '../repositories/posts-repository';
import { userAuthCheckMiddleware } from '../middlewares/userAuthCheckMiddleware';
import { CommentInputModel, CommentViewModel } from '../domain/comments/types/model/CommentsModels';
import { postCommentModelValidation } from '../domain/comments/validation/postCommentModelValidation';
import { commentService } from '../domain/comments/services/comment-service';
import { commentsRepository } from '../repositories/comments-repository';
import { commentsQueryRepository } from '../repositories/comments-query-repository';

export const postsRouter = express.Router();

class PostsController {
  async getPosts(
    req: RequestWithQuery<{ title?: string } & Partial<PaginationPayload<PostViewModel>>>,
    res: Response<WithPagination<PostViewModel>>
  ) {
    const pagination: PaginationPayload<PostViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const titleToFind = req?.query?.title || null;

    const foundedPost = await postsService.findPosts(titleToFind, pagination);

    res.status(STATUS_HTTP.OK_200).send(foundedPost);
  }

  async createPost(req: RequestWithBody<PostInputModel>, res: Response<PostViewModel>) {
    const createdPostId = await postsService.createPost(req.body);

    if (createdPostId) {
      const createdPost = await postsRepository.findPostById(createdPostId);
      res.status(STATUS_HTTP.CREATED_201).send(createdPost);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }

  async getPost(req: RequestWithParams<{ postId: string }>, res: Response<PostViewModel>) {
    const postId = req.params.postId;

    const foundedPost = await postsService.findPostById(postId);

    if (!foundedPost) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
    } else {
      res.status(STATUS_HTTP.OK_200).send(foundedPost);
    }
  }

  async deletePost(req: RequestWithParams<{ postId: string }>, res: Response<void>) {
    const postId = req.params.postId;

    const isVideoDeleted = await postsService.deletePost(postId);

    if (!isVideoDeleted) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    } else {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    }
  }

  async updatePost(req: RequestWithParamsAndBody<{ postId: string }, PostInputModel>, res: Response<PostViewModel>) {
    const postId = req.params.postId;

    const updatedPost = await postsService.updatePost(postId, req.body);

    if (!updatedPost) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }

  async getPostComments(
    req: RequestWithParamsAndQuery<{ postId: string }, Partial<PaginationPayload<CommentViewModel>>>,
    res: Response<WithPagination<CommentViewModel>>
  ) {
    const postId = req.params.postId;
    const userId = req?.user?.userId;

    const pagination: PaginationPayload<CommentViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const post = await postsRepository.findPostById(postId);

    if (!post) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    const comments = await commentsQueryRepository.findCommentsByPostId(postId, pagination, userId);

    res.status(STATUS_HTTP.OK_200).send(comments);
  }

  async createPostComment(
    req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>,
    res: Response<CommentViewModel>
  ) {
    const postId = req.params.postId;
    const content = req.body.content;

    const post = await postsRepository.findPostById(postId);

    if (!post) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    const createdCommentId = await commentService.createCommentForPost(postId, content, req.user);

    if (createdCommentId) {
      const commentFromDb = await commentsRepository.findCommentById(createdCommentId);

      if (commentFromDb) {
        const commentViewModel = await commentsQueryRepository.findCommentById(commentFromDb.id);

        res.status(STATUS_HTTP.CREATED_201).send(commentViewModel!);
        return;
      }
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }
}

const postsController = new PostsController();
postsRouter.get('/', postsController.getPosts);

postsRouter.post(
  '/',
  adminAuthCheckMiddleware,
  postInputModelValidation,
  validationCheckMiddleware,
  postsController.createPost
);
postsRouter.get('/:postId', postsController.getPost);
postsRouter.delete('/:postId', adminAuthCheckMiddleware, postsController.deletePost);
postsRouter.put(
  '/:postId',
  adminAuthCheckMiddleware,
  postInputModelValidation,
  validationCheckMiddleware,
  postsController.updatePost
);

postsRouter.get('/:postId/comments', postsController.getPostComments);

postsRouter.post(
  '/:postId/comments',
  userAuthCheckMiddleware,
  postCommentModelValidation,
  validationCheckMiddleware,
  postsController.createPostComment
);
