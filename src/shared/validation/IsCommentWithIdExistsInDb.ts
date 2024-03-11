import { PostsRepository } from '../../repositories/posts-repository';

export const isCommentWithIdExistsInDb = {
  notEmpty: {
    errorMessage: 'Field is required',
  },
  custom: {
    options: async (postId: string) => {
      try {
        const post = await new PostsRepository().findPostById(postId);
        if (!post) {
          throw new Error('Blog with current Id does not exist');
        }
      } catch (err) {
        throw new Error('Error checking blog existence');
      }
    },
    errorMessage: 'Post with current Id is not exists',
  },
};
