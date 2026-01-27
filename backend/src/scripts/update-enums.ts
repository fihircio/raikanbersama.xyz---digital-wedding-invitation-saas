import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || '', {
    dialect: 'postgres',
    logging: false
});

async function updateEnums() {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully');

        // Add new enum values
        await sequelize.query(`
      ALTER TYPE enum_orders_plan_tier ADD VALUE IF NOT EXISTS 'lite';
    `).catch(() => console.log('lite value already exists'));

        await sequelize.query(`
      ALTER TYPE enum_orders_plan_tier ADD VALUE IF NOT EXISTS 'pro';
    `).catch(() => console.log('pro value already exists'));

        // Update existing records in orders table
        await sequelize.query(`
      UPDATE orders SET plan_tier = 'lite' WHERE plan_tier = 'basic';
    `);

        await sequelize.query(`
      UPDATE orders SET plan_tier = 'pro' WHERE plan_tier = 'premium';
    `);

        // Update existing records in users table
        await sequelize.query(`
      UPDATE users SET membership_tier = 'lite' WHERE membership_tier = 'basic';
    `);

        await sequelize.query(`
      UPDATE users SET membership_tier = 'pro' WHERE membership_tier = 'premium';
    `);

        console.log('✅ Database enums updated successfully!');
        console.log('Updated orders and users tables to use new enum values');

        await sequelize.close();
    } catch (error) {
        console.error('Error updating enums:', error);
        process.exit(1);
    }
}

updateEnums();
