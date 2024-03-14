import { CommentDbModel } from '../domain/comments/types/model/CommentsModels';
import { CommentModel } from '../domain/comments/scheme/comments';
import { LIKE_STATUS } from '../domain/likes/types/model/LikesModels';
import { injectable } from 'inversify';
@injectable()
export class CommentsRepository {
  async createCommentForPost(comment: CommentDbModel) {
    const createdCommentResponse = await CommentModel.create(comment);

    if (createdCommentResponse._id) {
      return comment.id;
    }

    return null;
  }

  async updateCommentById(commentId: string, commentContent: string) {
    const createdCommentResponse = await CommentModel.updateOne(
      { id: commentId },
      {
        $set: {
          content: commentContent,
        },
      }
    );

    return createdCommentResponse.matchedCount === 1;
  }

  async findCommentById(commentId: string) {
    const comment = await CommentModel.findOne({ id: commentId });

    if (comment) {
      return comment;
    }

    return null;
  }

  async deleteCommentById(commentId: string) {
    const deleteResult = await CommentModel.deleteOne({ id: commentId });
    return deleteResult.deletedCount === 1;
  }

  async checkIfCommentHasLikeStatusByUser(commentId: string, userId: string) {
    const isCommentWithSomeLikeStatus = await CommentModel.findOne({ id: commentId, 'likes.userId': userId }).lean();

    return !!isCommentWithSomeLikeStatus;
  }

  async removeUsersLikeStatusByCommentAndUsersIds(commentId: string, userId: string) {
    const comment = await CommentModel.findOne({ id: commentId, 'likes.userId': userId });

    if (!comment) {
      return false;
    }

    comment.likes = comment?.likes.filter((dbLike) => {
      return dbLike.userId !== userId;
    });

    comment.save();

    return true;
  }

  async setOrUpdateLikeStatus(commentId: string, likeStatus: LIKE_STATUS, userId: string) {
    const comment = await this.findCommentById(commentId);

    if (!comment) {
      return false;
    }

    const existingLikeIndex = comment.likes.findIndex((like) => like.userId === userId);

    if (existingLikeIndex !== -1) {
      comment.likes[existingLikeIndex].status = likeStatus;
    } else {
      comment.likes.push({ status: likeStatus, userId });
    }

    const updatedComment = await comment.save();

    return !!updatedComment;
  }
}
