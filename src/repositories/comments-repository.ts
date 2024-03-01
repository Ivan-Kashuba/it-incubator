import { CommentDbModel, CommentViewModel } from '../domain/comments/types/model/CommentsModels';
import { PaginationPayload } from '../shared/types/Pagination';
import { createPaginationResponse, getSkip, getSortDirectionMongoValue } from '../shared/helpers/pagination';
import { mapDbCommentsToViewModel } from '../domain/comments/mappers/dbCommentToViewModel';
import { CommentModel } from '../db/schemes/comments';

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

  async findCommentsByPostId(postId: string, pagination: PaginationPayload<CommentViewModel>) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const dbComments = await CommentModel.find({ postId: postId }, { projection: { _id: 0 } })
      .sort({ [sortBy]: getSortDirectionMongoValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize);

    const totalCount = await CommentModel.countDocuments({ postId: postId });

    return createPaginationResponse<CommentViewModel>(pagination, mapDbCommentsToViewModel(dbComments), totalCount);
  }
}

export const commentsRepository = new CommentsRepository();
