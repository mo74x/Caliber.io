/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  // 1. Check if user exists & password matches
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);

    // Check password
    if (user && (await bcrypt.compare(pass, user.password))) {
      // Remove password before returning

      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  // 2. Generate the Token
  login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    };
  }
  // 1. Request Reset
  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    // Generate Token
    const token = uuidv4();

    // Save Token to DB (Expires in 1 hour)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send Email
    // Note: In real life, this URL points to your Frontend (e.g. localhost:3001/reset?token=...)
    const resetLink = `http://localhost:3001/auth/reset-password?token=${token}`;

    await this.mailService.sendResetPasswordEmail(user.email, resetLink);

    return { message: 'Password reset email sent' };
  }

  // 2. Reset Password
  async resetPassword(token: string, newPass: string) {
    // Find user with this token AND make sure time hasn't expired
    const user = await this.usersService.findOneByResetToken(token); // We need to create this in UsersService

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPass, 10);

    // Clear token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: 'Password successfully reset' };
  }
}
