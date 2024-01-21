import { EMAIL_REGEX } from '../helpers/regex';

export const emailValidationSchema = {
  trim: true,
  notEmpty: {
    errorMessage: 'Field is required',
  },
  matches: {
    options: EMAIL_REGEX,
    errorMessage: 'Do not match email pattern',
  },
};
