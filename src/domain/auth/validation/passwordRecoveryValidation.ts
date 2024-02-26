import { checkSchema, Schema } from 'express-validator';
import { emailValidationSchema } from '../../../shared/validation/emailValidationSchema';

const passwordRecoveryValidationSchema: Schema = {
  email: {
    ...emailValidationSchema,
  },
};

export const passwordRecoveryValidation = checkSchema(passwordRecoveryValidationSchema);
