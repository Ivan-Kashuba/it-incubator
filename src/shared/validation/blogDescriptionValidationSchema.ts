export const blogDescriptionValidationSchema = {
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
};
