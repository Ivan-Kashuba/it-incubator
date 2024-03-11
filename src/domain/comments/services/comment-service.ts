import { ObjectId } from 'mongodb';
import { UserTokenInfo } from '../../auth/types/model/Auth';
import { CommentsRepository } from '../../../repositories/comments-repository';
import { LIKE_STATUS } from '../../likes/types/model/LikesModels';
import { RESULT_CODES, ResultService } from '../../../shared/helpers/resultObject';
import { CommentDbModel } from '../types/model/CommentsModels';
import { injectable } from 'inversify';
@injectable()
export class CommentService {
  constructor(protected commentsRepository: CommentsRepository) {}

  async createCommentForPost(postId: string, content: string, userInfo: UserTokenInfo) {
    const commentToCreate: CommentDbModel = {
      id: new ObjectId().toString(),
      postId,
      content,
      commentatorInfo: {
        userId: userInfo.userId,
        userLogin: userInfo.login,
      },
      createdAt: new Date().toISOString(),
      likes: [],
    };

    const createdCommentId = await this.commentsRepository.createCommentForPost(commentToCreate);

    return createdCommentId;
  }

  async likeComment(commentId: string, likeStatus: LIKE_STATUS, userId: string) {
    const comment = await this.commentsRepository.findCommentById(commentId);

    if (!comment) {
      return ResultService.createResult(
        RESULT_CODES.Not_found,
        ResultService.createError('commentId', 'Comment is not exist')
      );
    }

    const isCommentAlreadyLikedOrDislikedByUser = await this.commentsRepository.checkIfCommentHasLikeStatusByUser(
      commentId,
      userId
    );

    if (isCommentAlreadyLikedOrDislikedByUser && likeStatus === LIKE_STATUS.None) {
      const isRemovedLike = await this.commentsRepository.removeUsersLikeStatusByCommentAndUsersIds(commentId, userId);

      if (isRemovedLike) {
        return ResultService.createResult(RESULT_CODES.Success_no_content);
      } else {
        return ResultService.createResult(RESULT_CODES.Db_problem);
      }
    }

    if (!isCommentAlreadyLikedOrDislikedByUser && likeStatus === LIKE_STATUS.None) {
      return ResultService.createResult(RESULT_CODES.Success_no_content);
    }

    const isLikeUpdated = await this.commentsRepository.setOrUpdateLikeStatus(commentId, likeStatus, userId);

    if (isLikeUpdated) {
      return ResultService.createResult(RESULT_CODES.Success_no_content);
    } else {
      return ResultService.createResult(RESULT_CODES.Db_problem);
    }
  }
}
