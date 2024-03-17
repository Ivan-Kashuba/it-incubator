import mongoose from 'mongoose';
import { CommentDbModel } from '../types/model/CommentsModels';
import { LikesSchema } from '../../likes/scheme/Likes';

export const CommentSchema = new mongoose.Schema<CommentDbModel>({
  id: { type: String, require: true },
  postId: { type: String, require: true },
  content: { type: String, require: true },
  createdAt: { type: String },
  commentatorInfo: { userId: { type: String, require: true }, userLogin: { type: String, require: true } },
  likes: [LikesSchema],
});
export const CommentModel = mongoose.model<CommentDbModel>('comments', CommentSchema);
