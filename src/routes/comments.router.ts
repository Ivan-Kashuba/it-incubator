import express from 'express';
import { userAuthCheckMiddleware } from '../middlewares/userAuthCheckMiddleware';
import { postCommentModelValidation } from '../domain/comments/validation/postCommentModelValidation';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { getUserInfoFromTokenWithoutAuthCheck } from '../middlewares/getUserInfoFromTokenWithoutAuthCheck';
import { inputLikeModelValidation } from '../domain/comments/validation/inputLikeValidationSchema';
import { container } from '../composition-root';
import { CommentsController } from '../controllers/comments-controller';

export const commentsRouter = express.Router();

const commentsController = container.get(CommentsController);

commentsRouter.get(
  '/:commentId',
  getUserInfoFromTokenWithoutAuthCheck,
  commentsController.getComment.bind(commentsController)
);

commentsRouter.put(
  '/:commentId',
  userAuthCheckMiddleware,
  postCommentModelValidation,
  validationCheckMiddleware,
  commentsController.updateComment.bind(commentsController)
);

commentsRouter.put(
  '/:commentId/like-status',
  userAuthCheckMiddleware,
  inputLikeModelValidation,
  validationCheckMiddleware,
  commentsController.updateCommentLikeStatus.bind(commentsController)
);

commentsRouter.delete(
  '/:commentId',
  userAuthCheckMiddleware,
  commentsController.deleteComment.bind(commentsController)
);
