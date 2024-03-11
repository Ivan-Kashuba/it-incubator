import { RequestWithParams, RequestWithParamsAndBody, STATUS_HTTP } from '../shared/types/index';
import { Response } from 'express';
import { CommentInputModel, CommentViewModel } from '../domain/comments/types/model/CommentsModels';
import { CommentsQueryRepository } from '../repositories/comments-query-repository';
import { CommentsRepository } from '../repositories/comments-repository';
import { LikeInputModel } from '../domain/likes/types/model/LikesModels';
import { CommentService } from '../domain/comments/services/comment-service';
import { ResultService } from '../shared/helpers/resultObject';
import { injectable } from 'inversify';

@injectable()
export class CommentsController {
  constructor(
    protected commentService: CommentService,
    protected commentsRepository: CommentsRepository,
    protected commentsQueryRepository: CommentsQueryRepository
  ) {}

  async getComment(req: RequestWithParams<{ commentId: string }>, res: Response<CommentViewModel>) {
    const commentId = req.params.commentId;
    const userId = req?.user?.userId;

    const comment = await this.commentsQueryRepository.findCommentById(commentId, userId);

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

    const commentToUpdate = await this.commentsRepository.findCommentById(commentId);

    if (!commentToUpdate) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    if (userId && userId !== commentToUpdate?.commentatorInfo.userId) {
      res.sendStatus(STATUS_HTTP.FORBIDDEN_403);
      return;
    }

    const isCommentUpdated = await this.commentsRepository.updateCommentById(commentId, req.body.content);

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

    const serviceResult = await this.commentService.likeComment(commentId, likeStatus, userId);

    const result = ResultService.mapResultToHttpResponse(serviceResult);

    res.status(result.statusCode).send(result.body);
  }

  async deleteComment(req: RequestWithParams<{ commentId: string }>, res: Response<CommentViewModel>) {
    const commentId = req.params.commentId;
    const commentToDelete = await this.commentsRepository.findCommentById(commentId);
    const userId = req?.user?.userId;

    if (!commentToDelete) {
      res.sendStatus(STATUS_HTTP.NOT_FOUND_404);
      return;
    }

    if (userId && userId !== commentToDelete?.commentatorInfo.userId) {
      res.sendStatus(STATUS_HTTP.FORBIDDEN_403);
      return;
    }

    const isCommentDeleted = await this.commentsRepository.deleteCommentById(commentId);

    if (isCommentDeleted) {
      res.sendStatus(STATUS_HTTP.NO_CONTENT_204);
      return;
    }

    res.sendStatus(STATUS_HTTP.NOT_IMPLEMENTED_501);
  }
}
