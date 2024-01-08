import { localDb } from '../../../db/local-db';
import { PostDbModel, PostInputModel, PostViewModel } from '../types/model/PostModels';
import { getBlogForPost, mapPostFromDbModelToView } from '../helpers/mapPostFromDbModelToView';
import { BlogViewModel } from '../../blogs/types/model/BlogModels';

export const postsLocalRepository = {
  async findPosts(title?: string) {
    if (!title) {
      return localDb.posts.map((post) => {
        return mapPostFromDbModelToView(post, getBlogForPost(post.blogId) as BlogViewModel);
      });
    }

    const foundedPosts = localDb.posts.filter((post) => {
      return post.title.includes(title);
    });

    const viewModelPosts: PostViewModel[] = foundedPosts.map((matchedPost) => {
      return mapPostFromDbModelToView(matchedPost, getBlogForPost(matchedPost.blogId) as BlogViewModel);
    });

    return viewModelPosts;
  },

  async findPostById(postId: string) {
    const foundedPost = localDb.posts.find((post) => {
      return post.id === postId;
    });

    const blog = getBlogForPost(foundedPost?.blogId);

    if (!blog) {
      return undefined;
    }

    return foundedPost ? mapPostFromDbModelToView(foundedPost, blog) : undefined;
  },

  async createPost(postInfo: PostInputModel) {
    const { content, shortDescription, title, blogId } = postInfo;

    const newPost: PostDbModel = {
      id: Math.floor(Math.random() * 100).toString(),
      content,
      shortDescription,
      title,
      blogId,
    };

    localDb.posts.push(newPost);

    return mapPostFromDbModelToView(newPost, getBlogForPost(blogId) as BlogViewModel);
  },

  async updatePost(postId: string, postInfo: PostInputModel) {
    const { content, shortDescription, title, blogId } = postInfo;
    const postToUpdate = await this.findPostById(postId);

    const blog = getBlogForPost(blogId);

    if (!blog || !postToUpdate) {
      return undefined;
    }

    const updatedPost: PostDbModel = {
      id: postToUpdate.id,
      content,
      shortDescription,
      title,
      blogId,
    };

    localDb.posts = localDb.posts.map((post) => {
      if (post.id === postId) {
        return updatedPost;
      }
      return post;
    });

    return mapPostFromDbModelToView(updatedPost, blog);
  },

  async deletePost(postId: string) {
    const postToDelete = localDb.posts.find((post) => {
      return post.id === postId;
    });

    if (!postToDelete) {
      return false;
    }

    const blog = getBlogForPost(postToDelete?.blogId);

    if (!blog) {
      return false;
    }

    localDb.posts = localDb.posts.filter((post) => {
      return post.id !== postId;
    });

    return true;
  },
};
