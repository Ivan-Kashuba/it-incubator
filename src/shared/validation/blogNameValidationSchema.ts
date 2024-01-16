export const blogNameValidationSchema = {
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
};
