import mongoose from 'mongoose';
import { ExtendedLikeDbModel, ExtendedLikesDbModel, LIKE_STATUS } from '../types/model/LikesModels';

const ExtendedLikeSchema = new mongoose.Schema<ExtendedLikeDbModel>({
  userId: { type: String, require: true },
  status: { type: String, enum: LIKE_STATUS },
  addedAt: { type: String, require: true, default: new Date().toISOString },
  firstLikeDate: { type: String, require: true, default: null },
  userLogin: { type: String, require: true },
});

export const ExtendedLikesSchema = new mongoose.Schema<ExtendedLikesDbModel>({
  likesCount: { type: Number, require: true },
  dislikesCount: { type: Number, require: true },
  extendedLikes: [ExtendedLikeSchema],
});
