import 'dotenv/config';
import MetaConversionsService from '../services/metaConversionsService';

/**
 * Sends one test Purchase event to Meta so you can confirm that
 * META_CAPI_ACCESS_TOKEN works before real money is involved.
 *
 * Usage:
 *   npm run test:capi                          # refuses unless a test event code is set
 *   npm run test:capi -- you@example.com 0123456789
 *   npm run test:capi -- --live                # deliberately report to live ad data
 *
 * By default this will NOT run without META_CAPI_TEST_EVENT_CODE, because an
 * untagged event counts as a real conversion in the ad account and distorts
 * reported revenue and cost per purchase. Set the code, or pass --live if you
 * genuinely mean to report to live data.
 */
const main = async (): Promise<void> => {
    if (!MetaConversionsService.isConfigured()) {
        console.error(
            'META_CAPI_ACCESS_TOKEN or META_PIXEL_ID is missing. Add them to backend/.env first.'
        );
        process.exit(1);
    }

    const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
    const live = process.argv.includes('--live');
    const hasTestCode = Boolean(process.env.META_CAPI_TEST_EVENT_CODE);

    // Without a test code this event lands in live ad data as a real purchase.
    if (!hasTestCode && !live) {
        console.error(
            'Refusing to run: META_CAPI_TEST_EVENT_CODE is not set, so this event would be\n' +
            'counted as a real purchase in live ad reporting.\n\n' +
            'Either set META_CAPI_TEST_EVENT_CODE (Events Manager > Test Events), or re-run\n' +
            'with --live if you really mean to send it to live data.'
        );
        process.exit(1);
    }

    if (!hasTestCode && live) {
        console.warn(
            'WARNING: sending to live ad data with no test event code. This will appear as a\n' +
            'real purchase and cannot be removed. Use a test code next time.'
        );
    }

    const email = args[0] || 'qa@raikanbersama.xyz';
    const phone = args[1] || '0123456789';
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
