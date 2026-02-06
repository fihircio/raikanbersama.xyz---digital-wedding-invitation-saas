import axios from 'axios';
import logger from './logger';

/**
 * Verify reCAPTCHA v2 token with Google's API
 * @param token - The reCAPTCHA response token from the frontend
 * @returns Promise<boolean> - True if verification succeeds
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
    if (!token) {
        logger.warn('reCAPTCHA verification failed: Token is missing');
        return false;
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
        logger.error('reCAPTCHA verification failed: RECAPTCHA_SECRET_KEY is not defined in environment');
        return false;
    }

    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: secretKey,
                    response: token
                }
            }
        );

        if (response.data.success) {
            return true;
        } else {
            logger.error('reCAPTCHA verification failed from Google:', {
                errorCodes: response.data['error-codes'],
                success: response.data.success
            });
            return false;
        }
    } catch (error) {
        logger.error('reCAPTCHA verification system error:', error);
        return false;
    }
}
