export const userPasswordValidationSchema = {
  trim: true,
  notEmpty: {
    errorMessage: 'Field is required',
  },
  isLength: {
    options: { min: 6, max: 20 },
    errorMessage: 'Length should be between 6 and 20',
  },
};
