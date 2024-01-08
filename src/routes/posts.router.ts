import express, { Response } from 'express';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
  STATUS_HTTP,
} from '../shared/types';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { authCheckMiddleware } from '../middlewares/authCheckMiddleware';
import { postInputModelValidation } from '../features/posts/validation/postInputModelValidation';
import { postsLocalRepository } from '../features/posts/repositories/posts-local-repository';
import { PostInputModel, PostViewModel } from '../features/posts/types/model/PostModels';

export const postRouter = express.Router();

postRouter.get('/', async (req: RequestWithQuery<{ title?: string }>, res: Response<PostViewModel[]>) => {
  const titleToFind = req?.query?.title;

  const foundedPost = await postsLocalRepository.findPosts(titleToFind);

  res.status(STATUS_HTTP.OK_200).send(foundedPost);
});

postRouter.post(
  '/',
  authCheckMiddleware,
  postInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithBody<PostInputModel>, res: Response<PostViewModel>) => {
    const createdPost = await postsLocalRepository.createPost(req.body);

    res.status(STATUS_HTTP.CREATED_201).send(createdPost);
  }
);
postRouter.get('/:postId', async (req: RequestWithParams<{ postId: string }>, res: Response<PostViewModel>) => {
  const postId = req.params.postId;

  const foundedPost = await postsLocalRepository.findPostById(postId);

  if (!foundedPost) {
    res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
    return;
  } else {
    res.status(STATUS_HTTP.OK_200).send(foundedPost);
  }
});
postRouter.delete(
  '/:postId',
  authCheckMiddleware,
  async (req: RequestWithParams<{ postId: string }>, res: Response<void>) => {
    const postId = req.params.postId;

    const isVideoDeleted = await postsLocalRepository.deletePost(postId);

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
  authCheckMiddleware,
  postInputModelValidation,
  validationCheckMiddleware,
  async (req: RequestWithParamsAndBody<{ postId: string }, PostInputModel>, res: Response<PostViewModel>) => {
    const postId = req.params.postId;

    const updatedPost = await postsLocalRepository.updatePost(postId, req.body);

    if (!updatedPost) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
  }
);
