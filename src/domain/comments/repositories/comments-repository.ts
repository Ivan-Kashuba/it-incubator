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

  async findCommentById(commentId: string) {
    const comment = await commentsCollection.findOne({ id: commentId });

    if (comment) {
      return comment;
    }

    return null;
  },

  async findCommentsByPostId(postId: string, pagination: PaginationPayload<CommentViewModel>) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const dbComments = await commentsCollection
      .find({ postId: postId }, { projection: { _id: 0 } })
      .sort({ [sortBy]: getSortValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize)
      .toArray();

    const totalCount = await usersCollection.countDocuments({ postId: postId });

    return createPaginationResponse<CommentViewModel>(pagination, mapDbCommentsToViewModel(dbComments), totalCount);
  },
};
