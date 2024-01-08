import { Video } from '../../features/videos/types/model/Video';
import { BlogViewModel } from '../../features/blogs/types/model/BlogModels';
import { PostDbModel } from '../../features/posts/types/model/PostModels';

export interface DataBase {
  videos: Video[];
  blogs: BlogViewModel[];
  posts: PostDbModel[];
}
