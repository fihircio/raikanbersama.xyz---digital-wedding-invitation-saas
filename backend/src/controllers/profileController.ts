import { Request, Response } from 'express';
import { User } from '../models';
import bcrypt from 'bcrypt';
import logger from '../utils/logger';

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        logger.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile'
        });
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { name, phone_number, company_name } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        await user.update({
            name: name || user.name,
            phone_number: phone_number !== undefined ? phone_number : user.phone_number,
            company_name: company_name !== undefined ? company_name : user.company_name
        });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                phone_number: user.phone_number,
                company_name: user.company_name,
                membership_tier: user.membership_tier
            }
        });
    } catch (error) {
        logger.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update profile'
        });
    }
};

/**
 * Change user password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            res.status(400).json({
                success: false,
                error: 'Old and new passwords are required'
            });
            return;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                error: 'User not found'
            });
            return;
        }

        // OAuth users don't have passwords
        if (!user.password) {
            res.status(400).json({
                success: false,
                error: 'OAuth users cannot change password using this method'
            });
            return;
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(400).json({
                success: false,
                error: 'Incorrect old password'
            });
            return;
        }

        // Hash and update new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        logger.error('Error changing password:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password'
        });
    }
};
