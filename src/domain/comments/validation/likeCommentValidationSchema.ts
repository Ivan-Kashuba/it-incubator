import { checkSchema, Schema } from 'express-validator';
import { commentLikeValidationSchema } from '../../../shared/validation/commentLikeValidationSchema';

const likeCommentValidationSchema: Schema = {
  likeStatus: commentLikeValidationSchema,
};
export const likeCommentValidation = checkSchema(likeCommentValidationSchema);
