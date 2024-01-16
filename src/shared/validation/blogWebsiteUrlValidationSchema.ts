import { URL_REGEX } from '../helpers/regex';

export const blogWebsiteUrlValidationSchema = {
  isLength: {
    options: { min: 1, max: 100 },
    errorMessage: 'Url length should be between 1 and 100',
  },
  matches: {
    options: URL_REGEX,
    errorMessage: 'Do not match url pattern',
  },
};
