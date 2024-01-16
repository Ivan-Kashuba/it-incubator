export const postShortDescriptionValidationSchema = {
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
};
