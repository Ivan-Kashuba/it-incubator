import { checkSchema, Schema } from 'express-validator';
import { userPasswordValidationSchema } from '../../../shared/validation/userPasswordValidationSchema';

const changePasswordValidationSchema: Schema = {
  newPassword: userPasswordValidationSchema,
  recoveryCode: {
    in: 'body',
    notEmpty: {
      errorMessage: 'Field is required',
    },
  },
};

export const changePasswordValidation = checkSchema(changePasswordValidationSchema);
