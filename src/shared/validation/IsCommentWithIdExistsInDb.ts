import { postsRepository } from '../../domain/posts/repositories/posts-repository';

export const isCommentWithIdExistsInDb = {
  notEmpty: {
    errorMessage: 'Field is required',
  },
  custom: {
    options: async (postId: string) => {
      try {
        const post = await postsRepository.findPostById(postId);
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
