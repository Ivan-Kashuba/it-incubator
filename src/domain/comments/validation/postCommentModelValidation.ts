import { checkSchema, Schema } from 'express-validator';
import { commentValidationSchema } from '../../../shared/validation/commentValidationSchema';

const postCommentModelValidationSchema: Schema = {
  content: commentValidationSchema,
};
export const postCommentModelValidation = checkSchema(postCommentModelValidationSchema);
