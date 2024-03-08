import express, { Response } from 'express';
import { RequestWithParams, RequestWithParamsAndBody, STATUS_HTTP } from '../shared/types/index';
import { CommentInputModel, CommentViewModel } from '../domain/comments/types/model/CommentsModels';
import { commentsRepository } from '../repositories/comments-repository';
import { userAuthCheckMiddleware } from '../middlewares/userAuthCheckMiddleware';
import { postCommentModelValidation } from '../domain/comments/validation/postCommentModelValidation';
import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { commentService } from '../domain/comments/services/comment-service';
import { LikeInputModel } from '../domain/likes/types/model/LikesModels';
import { ResultService } from '../shared/helpers/resultObject';
import { commentsQueryRepository } from '../repositories/comments-query-repository';
import { getUserInfoFromTokenWithoutAuthCheck } from '../middlewares/getUserInfoFromTokenWithoutAuthCheck';

export const commentsRouter = express.Router();

class CommentsController {
  async getComment(req: RequestWithParams<{ commentId: string }>, res: Response<CommentViewModel>) {
    const commentId = req.params.commentId;
    const userId = req?.user?.userId;

    const comment = await commentsQueryRepository.findCommentById(commentId, userId);

    if (!comment) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    res.status(STATUS_HTTP.OK_200).send(comment);
  }

  async updateComment(
    req: RequestWithParamsAndBody<{ commentId: string }, CommentInputModel>,
    res: Response<CommentViewModel>
  ) {
    const commentId = req.params.commentId;
    const userId = req?.user?.userId;

    const commentToUpdate = await commentsRepository.findCommentById(commentId);

    if (!commentToUpdate) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    if (userId && userId !== commentToUpdate?.commentatorInfo.userId) {
      res.sendStatus(STATUS_HTTP.FORBIDDEN_403);
      return;
    }

    const isCommentUpdated = await commentsRepository.updateCommentById(commentId, req.body.content);

    if (isCommentUpdated) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }
  async updateCommentLikeStatus(
    req: RequestWithParamsAndBody<{ commentId: string }, LikeInputModel>,
    res: Response<CommentViewModel>
  ) {
    const commentId = req.params.commentId;
    const userId = req?.user?.userId;
    const { likeStatus } = req.body;

    const serviceResult = await commentService.likeComment(commentId, likeStatus, userId);

    const result = ResultService.mapResultToHttpResponse(serviceResult);

    res.status(result.statusCode).send(result.body);
  }

  async deleteComment(req: RequestWithParams<{ commentId: string }>, res: Response<CommentViewModel>) {
    const commentId = req.params.commentId;
    const commentToDelete = await commentsRepository.findCommentById(commentId);
    const userId = req?.user?.userId;

    if (!commentToDelete) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    if (userId && userId !== commentToDelete?.commentatorInfo.userId) {
      res.sendStatus(STATUS_HTTP.FORBIDDEN_403);
      return;
    }

    const isCommentDeleted = await commentsRepository.deleteCommentById(commentId);

    if (isCommentDeleted) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }
}

const commentsController = new CommentsController();

commentsRouter.get('/:commentId', getUserInfoFromTokenWithoutAuthCheck, commentsController.getComment);

commentsRouter.put(
  '/:commentId',
  userAuthCheckMiddleware,
  postCommentModelValidation,
  validationCheckMiddleware,
  commentsController.updateComment
);

commentsRouter.put(
  '/:commentId/like-status',
  userAuthCheckMiddleware,
  // postCommentModelValidation,
  // validationCheckMiddleware,
  commentsController.updateCommentLikeStatus
);

commentsRouter.delete('/:commentId', userAuthCheckMiddleware, commentsController.deleteComment);
