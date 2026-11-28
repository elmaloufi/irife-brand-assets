import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

@Injectable()
export class EmailDeliveryService {
  private readonly logger = new Logger(EmailDeliveryService.name);

  async deliverOneTimeRecoveryCode(email: string, token: string): Promise<void> {
    await this.deliver(email, 'Reset your IRIFE password',
      `We received a request to reset your IRIFE password. Enter this one-time reset code in the IRIFE app within 30 minutes: ${token}. If you did not request this, you can ignore this email.`,
      'Password reset');
  }

  async deliverEmailVerificationCode(email: string, token: string): Promise<void> {
    await this.deliver(email, 'Verify your IRIFE email address',
      `Use this one-time verification code in the IRIFE app within 24 hours: ${token}. If you did not create an IRIFE account, you can ignore this email.`,
      'Email verification');
  }

  private async deliver(email: string, subject: string, message: string, purpose: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      this.logger.error(`${purpose} email is not configured. Set RESEND_API_KEY and EMAIL_FROM.`);
      throw new ServiceUnavailableException({ code: 'EMAIL_DELIVERY_NOT_CONFIGURED', message: 'Email delivery is temporarily unavailable. Please try again later.' });
    }

    let response: Response;
    try {
      response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [email], subject, text: message }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      this.logger.error(`${purpose} email delivery request failed.`);
      throw new ServiceUnavailableException({ code: 'EMAIL_DELIVERY_FAILED', message: 'Email delivery is temporarily unavailable. Please try again later.' });
    }

    if (!response.ok) {
      this.logger.error(`${purpose} email provider returned HTTP ${response.status}.`);
      throw new ServiceUnavailableException({ code: 'EMAIL_DELIVERY_FAILED', message: 'Email delivery is temporarily unavailable. Please try again later.' });
    }
  }
}
