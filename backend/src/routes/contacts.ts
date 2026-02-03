import { Router } from 'express';
import contactMessageController from '../controllers/contactMessageController';

const router = Router();

/**
 * @route   POST /api/contacts
 * @desc    Submit a contact message
 * @access  Public
 */
router.post('/', contactMessageController.submit);

export default router;
