import { checkSchema, Schema } from 'express-validator';
import { postTitleValidationSchema } from '../../../shared/validation/postTitleValidationSchema';
import { postContentValidationSchema } from '../../../shared/validation/postContentValidationSchema';
import { postShortDescriptionValidationSchema } from '../../../shared/validation/postShortDescriptionValidationSchema';
import { isBlogWithIdExistsInDbValidation } from '../../../shared/validation/isBlogWithIdExistsInDbValidation';

const postInputModelValidationSchema: Schema = {
  title: postTitleValidationSchema,
  content: postContentValidationSchema,
  shortDescription: postShortDescriptionValidationSchema,
  blogId: isBlogWithIdExistsInDbValidation,
};
export const postInputModelValidation = checkSchema(postInputModelValidationSchema);
