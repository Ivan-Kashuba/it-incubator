import { checkSchema, Schema } from 'express-validator';
import { postContentValidationSchema } from '../../../shared/validation/postContentValidationSchema';
import { postTitleValidationSchema } from '../../../shared/validation/postTitleValidationSchema';
import { postShortDescriptionValidationSchema } from '../../../shared/validation/postShortDescriptionValidationSchema';
import { isBlogWithIdExistsInDbValidation } from '../../../shared/validation/isBlogWithIdExistsInDbValidation';

const blogPostInputModelValidationSchema: Schema = {
  title: postTitleValidationSchema,
  content: postContentValidationSchema,
  shortDescription: postShortDescriptionValidationSchema,
  blogId: {
    in: 'params',
    ...isBlogWithIdExistsInDbValidation,
  },
};
export const blogPostInputModelValidation = checkSchema(blogPostInputModelValidationSchema);
