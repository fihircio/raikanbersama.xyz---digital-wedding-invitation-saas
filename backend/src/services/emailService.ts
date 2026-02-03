import nodemailer from 'nodemailer';
import logger from '../utils/logger';
import config from '../config';

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        });
    }

    /**
     * Send notification email when a new contact message is received
     */
    async sendContactNotification(data: {
        name: string;
        email: string;
        subject: string;
        message: string;
    }) {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            logger.warn('EmailService: GMAIL_USER or GMAIL_APP_PASSWORD not set. Skipping email notification.');
            return;
        }

        try {
            const mailOptions = {
                from: `"RaikanBersama System" <${process.env.GMAIL_USER}>`,
                to: process.env.GMAIL_USER, // Send to yourself (the admin)
                subject: `Peti Masuk Baru: ${data.subject}`,
                html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #e11d48;">Mesej Baru dari Borang Hubungi</h2>
            <p><strong>Nama:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subjek:</strong> ${data.subject}</p>
            <div style="background: #f4f4f4; padding: 15px; border-radius: 10px; margin-top: 10px;">
              <p style="white-space: pre-wrap;">${data.message}</p>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 20px;">
              Dihantar secara automatik oleh sistem RaikanBersama.xyz
            </p>
          </div>
        `,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email notification sent: ${info.messageId}`);
            return info;
        } catch (error) {
            logger.error('Error sending contact notification email:', error);
            throw error;
        }
    }
}

export default new EmailService();
