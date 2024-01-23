export const commentValidationSchema = {
  isString: {
    errorMessage: 'Must be string',
  },
  trim: true,
  notEmpty: {
    errorMessage: 'Field is required',
  },
  isLength: {
    options: { min: 20, max: 300 },
    errorMessage: 'Length should be between 20 and 300',
  },
};
