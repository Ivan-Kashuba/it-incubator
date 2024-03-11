import express from 'express';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { adminAuthCheckMiddleware } from '../middlewares/adminAuthCheckMiddleware';
import { postInputModelValidation } from '../domain/posts/validation/postInputModelValidation';
import { userAuthCheckMiddleware } from '../middlewares/userAuthCheckMiddleware';
import { postCommentModelValidation } from '../domain/comments/validation/postCommentModelValidation';
import { getUserInfoFromTokenWithoutAuthCheck } from '../middlewares/getUserInfoFromTokenWithoutAuthCheck';
import { container } from '../composition-root';
import { PostsController } from '../controllers/posts-controller';

export const postsRouter = express.Router();

const postsController = container.get(PostsController);
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

postsRouter.get('/:postId/comments', getUserInfoFromTokenWithoutAuthCheck, postsController.getPostComments);

postsRouter.post(
  '/:postId/comments',
  userAuthCheckMiddleware,
  postCommentModelValidation,
  validationCheckMiddleware,
  postsController.createPostComment
);
