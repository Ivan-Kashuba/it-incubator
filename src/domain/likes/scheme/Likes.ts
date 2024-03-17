import mongoose from 'mongoose';
import { LIKE_STATUS, LikeDbModel } from '../types/model/LikesModels';

export const LikesSchema = new mongoose.Schema<LikeDbModel>({
  userId: { type: String, require: true },
  status: { type: String, enum: LIKE_STATUS },
});
