import { checkSchema, Schema } from 'express-validator';

const authModelValidationSchema: Schema = {
  login: {
    trim: true,
    notEmpty: {
      errorMessage: 'Login is required',
    },
  },
  password: {
    trim: true,
    notEmpty: {
      errorMessage: 'Password is required',
    },
  },
};

export const authModelValidation = checkSchema(authModelValidationSchema);
