import { checkSchema, Schema } from 'express-validator';
import { commentValidationSchema } from '../../../shared/validation/commentValidationSchema';
import { isCommentWithIdExistsInDb } from '../../../shared/validation/IsCommentWithIdExistsInDb';

const postCommentModelValidationSchema: Schema = {
  content: commentValidationSchema,
};
export const postCommentModelValidation = checkSchema(postCommentModelValidationSchema);
