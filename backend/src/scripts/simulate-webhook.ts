import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
    dialect: 'postgres',
    logging: false
});

async function simulateWebhook() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Get the most recent pending order
        const [orders]: any = await sequelize.query(`
      SELECT id, invitation_id, plan_tier, status 
      FROM orders 
      WHERE status = 'pending' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

        if (orders.length === 0) {
            console.log('No pending orders found');
            await sequelize.close();
            return;
        }

        const order = orders[0];
        console.log('Found pending order:', order.id);

        // Update order status to completed
        await sequelize.query(`
      UPDATE orders 
      SET status = 'completed' 
      WHERE id = '${order.id}'
    `);
        console.log('✅ Order status updated to completed');

        // Update invitation package_plan
        if (order.invitation_id) {
            await sequelize.query(`
        UPDATE invitations 
        SET settings = jsonb_set(settings, '{package_plan}', '"${order.plan_tier}"')
        WHERE id = '${order.invitation_id}'
      `);
            console.log(`✅ Invitation ${order.invitation_id} upgraded to ${order.plan_tier}`);
        }

        console.log('\n🎉 Webhook simulation complete!');
        console.log('Refresh your browser to see the changes.');

        await sequelize.close();
    } catch (error) {
        console.error('Error simulating webhook:', error);
        process.exit(1);
    }
}

simulateWebhook();
