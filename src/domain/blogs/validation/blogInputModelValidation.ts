import { checkSchema, Schema } from 'express-validator';
import { URL_REGEX } from '../../../shared/helpers/regex';
import { blogNameValidationSchema } from '../../../shared/validation/blogNameValidationSchema';
import { blogDescriptionValidationSchema } from '../../../shared/validation/blogDescriptionValidationSchema';
import { blogWebsiteUrlValidationSchema } from '../../../shared/validation/blogWebsiteUrlValidationSchema';

const blogInputModelValidationSchema: Schema = {
  name: blogNameValidationSchema,
  description: blogDescriptionValidationSchema,
  websiteUrl: blogWebsiteUrlValidationSchema,
};
export const blogInputModelValidation = checkSchema(blogInputModelValidationSchema);
