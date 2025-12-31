import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUnlockNotification(to: string, name: string) {
    const url = `http://localhost:3000/dashboard`; // Link to frontend eventually

    await this.mailerService.sendMail({
      to: to,
      subject: "Good News! You caught someone's eye 👀",
      html: `
        <h1>Hi ${name},</h1>
        <p>A Recruiter just unlocked your profile on <b>Caliber</b>.</p>
        <p>Expect a call or email soon!</p>
        <br>
        <a href="${url}">Go to Dashboard</a>
      `,
    });

    console.log(`Email sent to ${name}`);
  }

  async sendResetPasswordEmail(to: string, url: string) {
    await this.mailerService.sendMail({
      to: to,
      subject: 'Reset your password',
      html: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password. It expires in 1 hour.</p>
        <a href="${url}">Reset Password</a>
      `,
    });
  }
}
