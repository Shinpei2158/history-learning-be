import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST', 'localhost'),
      port: this.configService.get('EMAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Xác thực tài khoản - Website Học Lịch Sử',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Xác thực tài khoản</h2>
          <p>Chào bạn!</p>
          <p>Cảm ơn bạn đã đăng ký tài khoản trên Website Học Lịch Sử. Vui lòng click vào link bên dưới để xác thực tài khoản của bạn:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Xác thực tài khoản
            </a>
          </div>
          <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,<br>Đội ngũ Website Học Lịch Sử</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Đặt lại mật khẩu - Website Học Lịch Sử',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Đặt lại mật khẩu</h2>
          <p>Chào bạn!</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Click vào link bên dưới để đặt lại mật khẩu:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p>Link này sẽ hết hạn sau 1 giờ.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,<br>Đội ngũ Website Học Lịch Sử</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}