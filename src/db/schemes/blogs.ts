import mongoose from 'mongoose';
import { BlogDBModel } from '../../domain/blogs/types/model/BlogModels';

export const BlogSchema = new mongoose.Schema<BlogDBModel>({
  id: { type: String, require: true },
  name: { type: String, require: true },
  description: { type: String, require: true },
  websiteUrl: { type: String },
  createdAt: { type: String, required: true },
  isMembership: { type: Boolean },
});
export const BlogModel = mongoose.model<BlogDBModel>('blogs', BlogSchema);
