import { Response } from 'express';
import { Affiliate } from '../models';
import { AuthenticatedRequest } from '../types/api';
import { AffiliateStatus } from '../types/models';
import logger from '../utils/logger';

class AffiliateController {
    /**
     * Submit an affiliate application
     */
    public async apply(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'User not authenticated.' });
                return;
            }

            const { business_name, business_type, social_link } = req.body;

            // Check if user already has an affiliate profile
            const existingAffiliate = await Affiliate.findOne({ where: { user_id: userId } });
            if (existingAffiliate) {
                res.status(400).json({
                    success: false,
                    error: 'You have already submitted an affiliate application.',
                    data: existingAffiliate
                });
                return;
            }

            const affiliate = await Affiliate.create({
                user_id: userId,
                business_name,
                business_type,
                social_link,
                status: AffiliateStatus.PENDING,
                earnings_total: 0
            });

            res.status(201).json({
                success: true,
                message: 'Application submitted successfully. Our team will review it shortly.',
                data: affiliate
            });
        } catch (error) {
            logger.error('Error submitting affiliate application:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to submit application.'
            });
        }
    }

    /**
     * Get current user's affiliate status/profile
     */
    public async getMyStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.id;
            const affiliate = await Affiliate.findOne({ where: { user_id: userId } });

            res.status(200).json({
                success: true,
                data: affiliate
            });
        } catch (error) {
            logger.error('Error fetching affiliate status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch affiliate status.'
            });
        }
    }
}

export default new AffiliateController();
