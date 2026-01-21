import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authenticate } from '../middleware/auth';
import { validateBody } from '../middleware/validation';

const router = Router();

// Get current profile
router.get('/', authenticate, profileController.getProfile);

// Update profile
router.put(
    '/',
    authenticate,
    validateBody({
        name: { type: 'string', min: 2, max: 100 },
        phone_number: { type: 'string', max: 20 },
        company_name: { type: 'string', max: 100 }
    }),
    profileController.updateProfile
);

// Change password
router.put(
    '/password',
    authenticate,
    validateBody({
        oldPassword: { type: 'string', required: true },
        newPassword: { type: 'string', required: true, min: 6 }
    }),
    profileController.changePassword
);

export default router;
