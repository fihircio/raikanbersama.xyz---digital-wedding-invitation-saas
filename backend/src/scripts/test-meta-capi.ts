import 'dotenv/config';
import MetaConversionsService from '../services/metaConversionsService';

/**
 * Sends one fake Purchase event to Meta so you can confirm that
 * META_CAPI_ACCESS_TOKEN works before real money is involved.
 *
 * Usage:
 *   npm run test:capi
 *   npm run test:capi -- you@example.com 0123456789
 *
 * Set META_CAPI_TEST_EVENT_CODE to route it into Events Manager > Test Events.
 */
const main = async (): Promise<void> => {
    if (!MetaConversionsService.isConfigured()) {
        console.error(
            'META_CAPI_ACCESS_TOKEN or META_PIXEL_ID is missing. Add them to backend/.env first.'
        );
        process.exit(1);
    }

    const email = process.argv[2] || 'qa@raikanbersama.xyz';
    const phone = process.argv[3] || '0123456789';
    const stamp = Date.now();

    console.log(`Sending test Purchase to pixel ${process.env.META_PIXEL_ID || '968435972628878'}...`);

    const ok = await MetaConversionsService.trackPurchase({
        orderId: `qa-order-${stamp}`,
        userId: `qa-user-${stamp}`,
        amount: 29,
        planTier: 'lite',
        email,
        phone,
        fullName: 'Raikan QA Test',
        eventSourceUrl: `${(process.env.FRONTEND_URL || 'https://www.raikanbersama.xyz').replace(/\/+$/, '')}/#/pricing`,
    });

    if (ok) {
        console.log('Purchase event accepted by Meta. Check Events Manager > Test Events (if a test code is set).');
        process.exit(0);
    }

    console.error('Meta rejected the event. Check the logged Graph API error above (token, pixel id, API version).');
    process.exit(1);
};

main().catch((error) => {
    console.error('Unexpected failure:', error);
    process.exit(1);
});
