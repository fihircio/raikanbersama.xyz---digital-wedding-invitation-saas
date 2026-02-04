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
            const formattedDate = new Date().toLocaleString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });

            const mailOptions = {
                from: `"RaikanBersama System" <${process.env.GMAIL_USER}>`,
                to: process.env.GMAIL_USER,
                replyTo: data.email,
                subject: `Peti Masuk Baru: ${data.subject}`,
                html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 15px;">
            <h2 style="color: #e11d48; border-bottom: 2px solid #fecdd3; padding-bottom: 10px;">Mesej Baru dari Borang Hubungi</h2>
            <div style="margin: 20px 0;">
                <p><strong>Nama:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Subjek:</strong> ${data.subject}</p>
                <p><strong>Tarikh:</strong> ${formattedDate}</p>
            </div>
            <div style="background: #fff5f7; padding: 20px; border-radius: 12px; border-left: 4px solid #e11d48; margin-top: 10px;">
              <p style="white-space: pre-wrap; margin: 0; font-size: 15px; line-height: 1.6;">${data.message}</p>
            </div>
            <div style="margin-top: 30px; text-align: center;">
                <a href="mailto:${data.email}?subject=Re: ${data.subject}" 
                   style="background: #e11d48; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
                   Balas Terus ke Gmail
                </a>
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center; border-top: 1px solid #eee; pt: 15px;">
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
