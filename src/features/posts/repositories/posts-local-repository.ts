import { localDb } from '../../../db/local-db';
import { PostDbModel, PostInputModel, PostViewModel } from '../types/model/PostModels';
import { mapPostFromDbModelToView } from '../helpers/mapPostFromDbModelToView';

export const postsLocalRepository = {
  async findPosts(title?: string) {
    if (!title) {
      return localDb.posts.map((post) => {
        return mapPostFromDbModelToView(post, post.blogId);
      });
    }

    const foundedPosts = localDb.posts.filter((post) => {
      return post.title.includes(title);
    });

    const viewModelPosts: PostViewModel[] = foundedPosts.map((matchedPost) => {
      return mapPostFromDbModelToView(matchedPost, matchedPost.blogId);
    });

    return viewModelPosts;
  },

  async findPostById(postId: string) {
    const foundedPost = localDb.posts.find((post) => {
      return post.id === postId;
    });

    return foundedPost ? mapPostFromDbModelToView(foundedPost, foundedPost.blogId) : undefined;
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

    return mapPostFromDbModelToView(newPost, blogId);
  },

  async updatePost(postId: string, postInfo: PostInputModel) {
    const { content, shortDescription, title, blogId } = postInfo;
    const postToUpdate = await this.findPostById(postId);

    if (!postToUpdate) {
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

    return mapPostFromDbModelToView(updatedPost, blogId);
  },

  async deletePost(postId: string) {
    const postToDelete = localDb.posts.find((post) => {
      return post.id === postId;
    });

    if (!postToDelete) {
      return false;
    }

    localDb.posts = localDb.posts.filter((post) => {
      return post.id !== postId;
    });

    return true;
  },
};
