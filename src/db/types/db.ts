import { BlogDBModel } from '../../features/blogs/types/model/BlogModels';
import { PostDbModel } from '../../features/posts/types/model/PostModels';

export interface DataBase {
  blogs: BlogDBModel[];
  posts: PostDbModel[];
}
