import { blogsMongoRepository } from '../../features/blogs/repositories/blogs-mongo-repository';

export const isBlogWithIdExistsInDbValidation = {
  notEmpty: {
    errorMessage: 'Field is required',
  },
  custom: {
    options: async (blogId: string) => {
      try {
        const blog = await blogsMongoRepository.findBlogById(blogId);
        if (!blog) {
          throw new Error('Blog with current Id does not exist');
        }
      } catch (err) {
        throw new Error('Error checking blog existence');
      }
    },
    errorMessage: 'Blog with current Id is not exists',
  },
};
