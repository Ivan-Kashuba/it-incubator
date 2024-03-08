import mongoose from 'mongoose';
import { CommentDbModel } from '../../domain/comments/types/model/CommentsModels';
import { LIKE_STATUS, LikeDbModel } from '../../domain/likes/types/model/LikesModels';

const LikesSchema = new mongoose.Schema<LikeDbModel>({
  userId: { type: String, require: true },
  status: { type: String, enum: LIKE_STATUS },
});

export const CommentSchema = new mongoose.Schema<CommentDbModel>({
  id: { type: String, require: true },
  postId: { type: String, require: true },
  content: { type: String, require: true },
  createdAt: { type: String },
  commentatorInfo: { userId: { type: String, require: true }, userLogin: { type: String, require: true } },
  likes: [LikesSchema],
});
export const CommentModel = mongoose.model<CommentDbModel>('comments', CommentSchema);
