import { commentsCollection, usersCollection } from '../../../db/mongoDb';
import { CommentDbModel, CommentViewModel } from '../types/model/CommentsModels';
import { PaginationPayload } from '../../../shared/types/Pagination';
import { createPaginationResponse, getSkip, getSortValue } from '../../../shared/helpers/pagination';
import { mapDbCommentsToViewModel } from '../mappers/dbCommentToViewModel';

export const commentsRepository = {
  async createCommentForPost(comment: CommentDbModel) {
    const createdCommentResponse = await commentsCollection.insertOne(comment);

    if (createdCommentResponse.insertedId) {
      return comment.id;
    }

    return null;
  },

  async updateCommentById(commentId: string, commentContent: string) {
    const createdCommentResponse = await commentsCollection.updateOne(
      { id: commentId },
      {
        $set: {
          content: commentContent,
        },
      }
    );

    return createdCommentResponse.matchedCount === 1;
  },

  async findCommentById(commentId: string) {
    const comment = await commentsCollection.findOne({ id: commentId });

    if (comment) {
      return comment;
    }

    return null;
  },

  async deleteCommentById(commentId: string) {
    const deleteResult = await commentsCollection.deleteOne({ id: commentId });
    return deleteResult.deletedCount === 1;
  },

  async findCommentsByPostId(postId: string, pagination: PaginationPayload<CommentViewModel>) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const dbComments = await commentsCollection
      .find({ postId: postId }, { projection: { _id: 0 } })
      .sort({ [sortBy]: getSortValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize)
      .toArray();

    const totalCount = await commentsCollection.countDocuments({ postId: postId });

    return createPaginationResponse<CommentViewModel>(pagination, mapDbCommentsToViewModel(dbComments), totalCount);
  },
};
