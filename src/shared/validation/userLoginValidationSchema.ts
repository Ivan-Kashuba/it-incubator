import { LOGIN_REGEX } from '../helpers/regex';

export const userLoginValidationSchema = {
  trim: true,
  notEmpty: {
    errorMessage: 'Field is required',
  },
  isLength: {
    options: { min: 3, max: 10 },
    errorMessage: 'Length should be between 3 and 10',
  },
  matches: {
    options: LOGIN_REGEX,
    errorMessage: 'Do not match login pattern',
  },
};
