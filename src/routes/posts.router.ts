import express, { Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
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
import { postsRepository } from '../domain/posts/repositories/posts-repository';

export const postRouter = express.Router();

postRouter.get(
  '/',
  async (
    req: RequestWithQuery<{ title?: string } & Partial<PaginationPayload<PostViewModel>>>,
    res: Response<WithPagination<PostViewModel>>
  ) => {
    const pagination: PaginationPayload<PostViewModel> = validatePayloadPagination(req.query, 'createdAt');

    const titleToFind = req?.query?.title || null;

    const foundedPost = await postsService.findPosts(titleToFind, pagination);

    res.status(STATUS_HTTP.OK_200).send(foundedPost);
  }
);

postRouter.post(
  '/',
  adminAuthCheckMiddleware,
  postInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<PostInputModel>, res: Response<PostViewModel>) => {
    const createdPostId = await postsService.createPost(req.body);

    if (createdPostId) {
      const createdPost = await postsRepository.findPostById(createdPostId);
      res.status(STATUS_HTTP.CREATED_201).send(createdPost);
      return;
    }

    res.sendStatus(STATUS_HTTP.INTERNAL_ERROR_500);
  }
);
postRouter.get('/:postId', async (req: RequestWithParams<{ postId: string }>, res: Response<PostViewModel>) => {
  const postId = req.params.postId;

  const foundedPost = await postsService.findPostById(postId);

  if (!foundedPost) {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
  } else {
    res.status(STATUS_HTTP.OK_200).send(foundedPost);
  }
});
postRouter.delete(
  '/:postId',
  adminAuthCheckMiddleware,
  async (req: RequestWithParams<{ postId: string }>, res: Response<void>) => {
    const postId = req.params.postId;

    const isVideoDeleted = await postsService.deletePost(postId);

    if (!isVideoDeleted) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    } else {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
    }
  }
);
postRouter.put(
  '/:postId',
  adminAuthCheckMiddleware,
  postInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithParamsAndBody<{ postId: string }, PostInputModel>, res: Response<PostViewModel>) => {
    const postId = req.params.postId;

    const updatedPost = await postsService.updatePost(postId, req.body);

    if (!updatedPost) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }
);
