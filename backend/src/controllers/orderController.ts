import { Request, Response } from 'express';
import { Order, Invitation } from '../models';
import logger from '../utils/logger';

/**
 * Get all orders for the current user
 */
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;

        const orders = await Order.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Invitation,
                    as: 'invitation',
                    attributes: ['id', 'slug', 'bride_name', 'groom_name', 'event_type']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        logger.error('Error fetching user orders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const order = await Order.findOne({
            where: { id, user_id: userId },
            include: [
                {
                    model: Invitation,
                    as: 'invitation'
                }
            ]
        });

        if (!order) {
            res.status(404).json({
                success: false,
                error: 'Order not found'
            });
            return;
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        logger.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order details'
        });
    }
};
