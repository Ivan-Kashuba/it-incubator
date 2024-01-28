import { checkSchema, Schema } from 'express-validator';
import { usersRepository } from '../../../repositories/users-repository';
import { isBefore } from 'date-fns';

const confirmationByRegistrationCodeValidationSchema: Schema = {
  code: {
    in: 'body',
    notEmpty: {
      errorMessage: 'Field is required',
    },
    custom: {
      options: async (code: string) => {
        try {
          const user = await usersRepository.findUserByRegistrationActivationCode(code);
          if (!user) throw new Error('Error');
          if (!user.accountConfirmation.expirationDate) throw new Error('Error');
          if (user.accountConfirmation.isConfirmed) throw new Error('Error');

          const isCodeExpired = isBefore(user?.accountConfirmation.expirationDate, new Date());

          if (isCodeExpired) {
            throw new Error('Error');
          }
        } catch (err) {
          throw new Error('Error');
        }
      },
      errorMessage: 'Code is not valid or expired',
    },
  },
};

export const confirmationByRegistrationCodeValidation = checkSchema(confirmationByRegistrationCodeValidationSchema);
