import { PostDbModel, PostViewModel } from '../types/model/PostModels';
import { localDb } from '../../../db/local-db';
import { BlogViewModel } from '../../blogs/types/model/BlogModels';

export const getBlogForPost = (blogId?: string) => {
  return localDb.blogs.find((blog) => {
    return blog.id === blogId;
  });
};

export const mapPostFromDbModelToView = (dbPost: PostDbModel, blogId: string): PostViewModel => {
  const blog = getBlogForPost(blogId) as BlogViewModel;

  const postVieModel: PostViewModel = {
    id: dbPost.id,
    blogId: blog.id,
    title: dbPost.title,
    blogName: blog.name,
    content: dbPost.content,
    shortDescription: dbPost.shortDescription,
  };

  return postVieModel;
};
