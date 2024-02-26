import mongoose from 'mongoose';
import { PostDbModel } from '../../domain/posts/types/model/PostModels';

export const PostSchema = new mongoose.Schema<PostDbModel>({
  id: { type: String, require: true },
  title: { type: String, require: true },
  shortDescription: { type: String, require: true },
  blogId: { type: String },
  createdAt: { type: String, required: true },
  content: { type: String },
});
export const PostModel = mongoose.model<PostDbModel>('posts', PostSchema);
