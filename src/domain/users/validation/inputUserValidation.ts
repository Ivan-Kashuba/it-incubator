import { checkSchema, Schema } from 'express-validator';
import { userPasswordValidationSchema } from '../../../shared/validation/userPasswordValidationSchema';
import { emailValidationSchema } from '../../../shared/validation/emailValidationSchema';
import { userLoginValidationSchema } from '../../../shared/validation/userLoginValidationSchema';

import { usersRepository } from '../../../composition-root';

const inputUserValidationSchema: Schema = {
  login: {
    ...userLoginValidationSchema,
    custom: {
      options: async (login: string) => {
        try {
          const user = await usersRepository.findUserByLoginOrEmail(login);
          if (user) {
            throw new Error('Error');
          }
        } catch (err) {
          throw new Error('Error');
        }
      },
      errorMessage: 'Login already in use',
    },
  },
  email: {
    ...emailValidationSchema,
    custom: {
      options: async (email: string) => {
        try {
          const user = await usersRepository.findUserByLoginOrEmail(email);
          if (user) {
            throw new Error('Error');
          }
        } catch (err) {
          throw new Error('Error');
        }
      },
      errorMessage: 'Email already in use',
    },
  },
  password: userPasswordValidationSchema,
};
export const inputUserValidation = checkSchema(inputUserValidationSchema);
