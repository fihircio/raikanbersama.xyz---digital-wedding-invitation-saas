import { Request, Response } from 'express';
import { ContactMessage } from '../models';
import { ContactMessageStatus } from '../types/models';
import logger from '../utils/logger';

class ContactMessageController {
    /**
     * Submit a contact message
     */
    public async submit(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, subject, message } = req.body;

            if (!name || !email || !subject || !message) {
                res.status(400).json({
                    success: false,
                    error: 'Please provide all required fields (name, email, subject, message).'
                });
                return;
            }

            const contactMessage = await ContactMessage.create({
                name,
                email,
                subject,
                message,
                status: ContactMessageStatus.NEW
            });

            logger.info(`New contact message received from ${email}`);

            res.status(201).json({
                success: true,
                message: 'Your message has been sent successfully. We will get back to you soon!',
                data: contactMessage
            });
        } catch (error) {
            logger.error('Error submitting contact message:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to send message.'
            });
        }
    }
}

export default new ContactMessageController();
