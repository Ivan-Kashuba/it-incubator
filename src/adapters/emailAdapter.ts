import nodemailer from 'nodemailer';
import { envConfig } from '../shared/helpers/env-config';
export const emailManager = {
  _getGoogleEmailConfiguration() {
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
  },
  async sendRegistrationConfirmEmail(userEmail: string, code: string) {
    console.log('+++');

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
  },
};
