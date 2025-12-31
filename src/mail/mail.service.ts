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
}
