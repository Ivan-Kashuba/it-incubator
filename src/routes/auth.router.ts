import express from 'express';

import { validationCheckMiddleware } from '../middlewares/validationCheckMiddleware';
import { authModelValidation } from '../domain/auth/validation/authModelValidation';
import { userAuthCheckMiddleware } from '../middlewares/userAuthCheckMiddleware';
import { inputUserValidation } from '../domain/users/validation/inputUserValidation';
import { confirmationByRegistrationCodeValidation } from '../domain/auth/validation/confirmationByRegistrationCodeValidation';
import { setRateLimit } from '../middlewares/rateLimit';
import { passwordRecoveryValidation } from '../domain/auth/validation/passwordRecoveryValidation';
import { resendEmailForRegistrationConfirmationValidation } from '../domain/auth/validation/resendEmailForRegistrationConfirmationValidation';
import { changePasswordValidation } from '../domain/auth/validation/changePasswordValidation';
import { container } from '../composition-root';
import { AuthController } from '../controllers/auth-controller';

export const authRouter = express.Router();
const authController = container.get(AuthController);

authRouter.post(
  '/login',
  setRateLimit(),
  authModelValidation,
  validationCheckMiddleware,
  authController.login.bind(authController)
);

authRouter.post(
  '/registration',
  setRateLimit(),
  inputUserValidation,
  validationCheckMiddleware,
  authController.register.bind(authController)
);

authRouter.post(
  '/registration-email-resending',
  setRateLimit(),
  resendEmailForRegistrationConfirmationValidation,
  validationCheckMiddleware,
  authController.resendRegistrationEmail.bind(authController)
);

authRouter.post(
  '/registration-confirmation',
  setRateLimit(),
  confirmationByRegistrationCodeValidation,
  validationCheckMiddleware,
  authController.confirmRegistration.bind(authController)
);

authRouter.get('/me', userAuthCheckMiddleware, authController.me.bind(authController));

authRouter.post('/refresh-token', authController.refreshToken.bind(authController));

authRouter.post('/logout', authController.logout.bind(authController));

authRouter.post(
  '/password-recovery',
  setRateLimit(),
  passwordRecoveryValidation,
  validationCheckMiddleware,
  authController.recoveryPassword.bind(authController)
);

authRouter.post(
  '/new-password',
  setRateLimit(),
  changePasswordValidation,
  validationCheckMiddleware,
  authController.setNewPassword.bind(authController)
);
