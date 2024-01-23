import { BlogDBModel } from '../../domain/blogs/types/model/BlogModels';
import { PostDbModel } from '../../domain/posts/types/model/PostModels';

export interface DataBase {
  blogs: BlogDBModel[];
  posts: PostDbModel[];
}
