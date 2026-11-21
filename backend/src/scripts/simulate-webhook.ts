import { Sequelize, QueryTypes, Transaction } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Marks one order as paid and unlocks its card, without any money changing hands.
 *
 * This exists so the post-payment flow can be tested locally. It is deliberately
 * hard to run by accident:
 *
 *   - it refuses to run when NODE_ENV is production;
 *   - it refuses to run against a database that is not on this machine;
 *   - it requires an explicit order id, so it can never pick "the newest pending
 *     order" and silently hand out paid access to whichever card happens to be there.
 *
 * Usage:
 *   npx ts-node src/scripts/simulate-webhook.ts --order=<order-uuid>
 */

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'host.docker.internal']);

// Declared as a function (not an arrow const) so TypeScript narrows types after
// a call to it, which keeps the checks below branch-free.
function fail(message: string): never {
    console.error(`Refusing to run: ${message}`);
    process.exit(1);
}

/** Parses a DATABASE_URL into its host, or null when it cannot be read. */
const databaseHost = (url: string): string | null => {
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
};

async function simulateWebhook(): Promise<void> {
    const databaseUrl = process.env.DATABASE_URL || '';

    if (process.env.NODE_ENV === 'production') {
        fail('NODE_ENV is production. This script only unlocks cards for local testing.');
    }

    const host = databaseHost(databaseUrl);
    if (!host) {
        fail('DATABASE_URL is missing or unreadable.');
    }
    if (!LOCAL_HOSTS.has(host)) {
        fail(
            `DATABASE_URL points at "${host}", which is not this machine. ` +
            'This script marks an order paid with no payment, so it is limited to a local database.'
        );
    }

    const orderArg = process.argv
        .slice(2)
        .find((arg) => arg.startsWith('--order='))
        ?.split('=')[1]
        ?.trim();

    if (!orderArg) {
        fail(
            'an order id is required, e.g. --order=<uuid>. ' +
            'It will not guess which order you meant.'
        );
    }

    const sequelize = new Sequelize(databaseUrl, { dialect: 'postgres', logging: false });

    try {
        await sequelize.authenticate();
        console.log(`Database connected (${host})`);

        const order = await sequelize.query<{
            id: string;
            invitation_id: string | null;
            plan_tier: string;
            status: string;
        }>(
            `SELECT id, invitation_id, plan_tier, status
               FROM orders
              WHERE id = :orderId
              LIMIT 1`,
            { replacements: { orderId: orderArg }, type: QueryTypes.SELECT }
        ).then((rows) => (Array.isArray(rows) ? rows[0] : rows));

        if (!order) {
            fail(`no order found with id ${orderArg}.`);
        }
        if (order!.status !== 'pending') {
            fail(`order ${order.id} is "${order!.status}", not "pending". Nothing to simulate.`);
        }

        console.log(`Order ${order.id} · plan ${order.plan_tier} · invitation ${order.invitation_id ?? 'none'}`);
        console.log('Marking paid and activating the card…');

        await sequelize.transaction(async (t: Transaction) => {
            await sequelize.query(
                `UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = :orderId`,
                { replacements: { orderId: order.id }, transaction: t }
            );

            if (order.invitation_id) {
                await sequelize.query(
                    `UPDATE invitations
                        SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{package_plan}', to_jsonb(:plan::text)),
                            updated_at = NOW()
                      WHERE id = :invitationId`,
                    {
                        replacements: { plan: order.plan_tier, invitationId: order.invitation_id },
                        transaction: t,
                    }
                );
            }
        });

        console.log('Done. The order is paid and the card is on its package.');
        console.log('Note: no payment was taken and no receipt exists. Local testing only.');
    } catch (error) {
        console.error('Error simulating the payment:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

simulateWebhook();
