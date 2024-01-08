import { checkSchema, Schema } from 'express-validator';
import { URL_REGEX } from '../../../shared/helpers/regex';

const blogInputModelValidationSchema: Schema = {
  name: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'Field is required',
    },
    isLength: {
      options: { min: 1, max: 15 },
      errorMessage: 'Name length should be between 1 and 15',
    },
  },
  description: {
    isString: {
      errorMessage: 'Must be string',
    },
    trim: true,
    notEmpty: {
      errorMessage: 'Description is required',
    },
    isLength: {
      options: { min: 1, max: 500 },
      errorMessage: 'Description length should be between 1 and 20',
    },
  },
  websiteUrl: {
    isLength: {
      options: { min: 1, max: 100 },
      errorMessage: 'Url length should be between 1 and 100',
    },
    matches: {
      options: URL_REGEX,
      errorMessage: 'Do not match url pattern',
    },
  },
};
export const blogInputModelValidation = checkSchema(blogInputModelValidationSchema);
