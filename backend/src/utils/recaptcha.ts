import axios from 'axios';

/**
 * Verify reCAPTCHA v2 token with Google's API
 * @param token - The reCAPTCHA response token from the frontend
 * @returns Promise<boolean> - True if verification succeeds
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
    if (!token) {
        return false;
    }

    try {
        const response = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: token
                }
            }
        );

        // For v2, just check if success is true
        return response.data.success === true;
    } catch (error) {
        console.error('reCAPTCHA verification failed:', error);
        return false;
    }
}
