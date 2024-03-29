import nodemailer from 'nodemailer';
import { envConfig } from '../shared/helpers/env-config';
export class EmailManager {
  private _getGoogleEmailConfiguration() {
    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'blog.kashuba.sender@gmail.com',
        pass: envConfig.EMAIL_SENDER_PASSWORD,
      },
    });

    const defaultMailDetails = {
      from: 'Blog <blog.kashuba.sender@gmail.com>',
      subject: 'Blog operation',
    };

    return { mailTransporter, defaultMailDetails };
  }
  async sendRegistrationConfirmEmail(userEmail: string, code: string) {
    const { defaultMailDetails, mailTransporter } = this._getGoogleEmailConfiguration();

    try {
      await mailTransporter.sendMail({
        ...defaultMailDetails,
        to: userEmail,
        subject: 'Registration confirm',
        html: `<div>Hey! This email has been sent from Blog to confirm your email<br/><br/><a href="https://some-front.com/confirm-registration?code=${code}">Click here to confirm your email</a></div>`,
      });
      return true;
    } catch (err) {
      return false;
    }
  }

  async sendPasswordRecoveryEmail(userEmail: string, code: string) {
    const { defaultMailDetails, mailTransporter } = this._getGoogleEmailConfiguration();

    try {
      await mailTransporter.sendMail({
        ...defaultMailDetails,
        to: userEmail,
        subject: 'Password recovery',
        html: `<div>Hey! This email has been sent from Blog to recover your password<br/><br/><a href="https://some-front.com/password-recovery?recoveryCode=${code}">Click here to recover your password</a></div>`,
      });
      return true;
    } catch (err) {
      return false;
    }
  }
}

export const emailManager = new EmailManager();
