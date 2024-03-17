import { checkSchema, Schema } from 'express-validator';
import { inputLikeValidationSchema } from '../../../shared/validation/inputLikeValidationSchema';

const inputLikeModelValidationSchema: Schema = {
  likeStatus: inputLikeValidationSchema,
};
export const inputLikeModelValidation = checkSchema(inputLikeModelValidationSchema);
