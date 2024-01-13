import { checkSchema, Schema } from 'express-validator';
import { blogsMongoRepository } from '../../blogs/repositories/blogs-mongo-repository';

const postInputModelValidationSchema: Schema = {
  title: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'Field is required',
    },
    isLength: {
      options: { min: 1, max: 30 },
      errorMessage: 'Title length should be between 1 and 30',
    },
  },
  shortDescription: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'shortDescription is required',
    },
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'shortDescription length should be between 1 and 100',
    },
  },
  content: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'content is required',
    },
    isLength: {
      options: { min: 1, max: 1000 },
      errorMessage: 'content length should be between 1 and 1000',
    },
  },
  blogId: {
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
  },
};
export const postInputModelValidation = checkSchema(postInputModelValidationSchema);
