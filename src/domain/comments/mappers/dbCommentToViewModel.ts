import { CommentDbModel, CommentViewModel } from '../types/model/CommentsModels';

export const mapDbCommentsToViewModel = (dbComments: CommentDbModel[]) => {
  return dbComments.map(mapDbCommentToViewModel);
};

export const mapDbCommentToViewModel = (dbComment: CommentDbModel) => {
  const commentViewModel: CommentViewModel = {
    id: dbComment.id,
    commentatorInfo: dbComment.commentatorInfo,
    content: dbComment.content,
    createdAt: dbComment.createdAt,
  };

  return commentViewModel;
};
