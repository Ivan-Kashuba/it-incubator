import { BlogViewModel } from '../../features/blogs/types/model/BlogModels';
import { PostDbModel } from '../../features/posts/types/model/PostModels';

export interface DataBase {
  blogs: BlogViewModel[];
  posts: PostDbModel[];
}
