import { checkSchema, Schema } from 'express-validator';
import { emailValidationSchema } from '../../../shared/validation/emailValidationSchema';
import { usersRepository } from '../../../repositories/users-repository';

const resendEmailForRegistrationConfirmationValidationSchema: Schema = {
  email: {
    ...emailValidationSchema,
    custom: {
      options: async (email: string) => {
        try {
          const user = await usersRepository.findUserByLoginOrEmail(email);

          if (!user || user?.accountConfirmation.isConfirmed) {
            throw new Error('Error');
          }
        } catch (err) {
          throw new Error('Error');
        }
      },
      errorMessage: 'Email for confirmation is not found',
    },
  },
};

export const resendEmailForRegistrationConfirmationValidation = checkSchema(
  resendEmailForRegistrationConfirmationValidationSchema
);
