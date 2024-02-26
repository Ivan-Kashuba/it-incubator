import mongoose from 'mongoose';
import { PostDbModel } from '../../domain/posts/types/model/PostModels';
import { CommentDbModel } from '../../domain/comments/types/model/CommentsModels';

export const CommentSchema = new mongoose.Schema<CommentDbModel>({
  id: { type: String, require: true },
  postId: { type: String, require: true },
  content: { type: String, require: true },
  createdAt: { type: String },
  commentatorInfo: { userId: { type: String, require: true }, userLogin: { type: String, require: true } },
});
export const CommentModel = mongoose.model<CommentDbModel>('comments', CommentSchema);
