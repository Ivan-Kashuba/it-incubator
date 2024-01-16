export const postContentValidationSchema = {
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
};
