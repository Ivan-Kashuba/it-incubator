export const postTitleValidationSchema = {
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
};
