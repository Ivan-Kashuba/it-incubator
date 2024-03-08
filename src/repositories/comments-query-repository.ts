import { CommentDbModel, CommentViewModel } from '../domain/comments/types/model/CommentsModels';
import { PaginationPayload } from '../shared/types/Pagination';
import { createPaginationResponse, getSkip, getSortDirectionMongoValue } from '../shared/helpers/pagination';
import { CommentModel } from '../db/schemes/comments';
import { LIKE_STATUS } from '../domain/likes/types/model/LikesModels';

export class CommentsQueryRepository {
  async findCommentById(commentId: string, userId?: string) {
    const comment = await CommentModel.findOne({ id: commentId });

    if (comment) {
      return this._mapDbCommentToViewModel(comment, userId);
    }

    return null;
  }

  async findCommentsByPostId(postId: string, pagination: PaginationPayload<CommentViewModel>, userId?: string) {
    const { pageNumber, pageSize, sortBy, sortDirection } = pagination;

    const dbComments = await CommentModel.find({ postId: postId }, { projection: { _id: 0 } })
      .sort({ [sortBy]: getSortDirectionMongoValue(sortDirection) })
      .skip(getSkip(pageNumber, pageSize))
      .limit(pagination.pageSize);

    const totalCount = await CommentModel.countDocuments({ postId: postId });

    const viewComments = dbComments.map((dbComment) => this._mapDbCommentToViewModel(dbComment, userId));

    return createPaginationResponse<CommentViewModel>(pagination, viewComments, totalCount);
  }

  _mapDbCommentToViewModel(dbComment: CommentDbModel, userId?: string): CommentViewModel {
    const dbLikes = dbComment.likes;

    const likesCount = dbLikes.filter((like) => like.status === LIKE_STATUS.Like).length;
    const dislikesCount = dbLikes.filter((like) => like.status === LIKE_STATUS.Dislike).length;
    const userLikeStatus = dbLikes.find((like) => like.userId === userId)?.status || LIKE_STATUS.None;

    const commentViewModel: CommentViewModel = {
      id: dbComment.id,
      commentatorInfo: dbComment.commentatorInfo,
      content: dbComment.content,
      createdAt: dbComment.createdAt,
      likesInfo: { likesCount, dislikesCount, myStatus: userLikeStatus },
    };

    return commentViewModel;
  }
}

export const commentsQueryRepository = new CommentsQueryRepository();
