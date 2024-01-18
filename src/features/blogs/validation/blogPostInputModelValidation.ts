import { checkSchema, Schema } from 'express-validator';
import { postContentValidationSchema } from '../../../shared/validation/postContentValidationSchema';
import { postTitleValidationSchema } from '../../../shared/validation/postTitleValidationSchema';
import { postShortDescriptionValidationSchema } from '../../../shared/validation/postShortDescriptionValidationSchema';

const blogPostInputModelValidationSchema: Schema = {
  title: postTitleValidationSchema,
  content: postContentValidationSchema,
  shortDescription: postShortDescriptionValidationSchema,
};
export const blogPostInputModelValidation = checkSchema(blogPostInputModelValidationSchema);
