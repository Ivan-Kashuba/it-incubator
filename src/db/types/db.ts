import { Video } from '../../features/videos/types/model/Video';
import { BlogViewModel } from '../../features/blogs/types/model/BlogViewModel';

export interface DataBase {
  videos: Video[];
  blogs: BlogViewModel[];
}
