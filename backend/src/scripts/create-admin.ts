import { connectDatabase, closeDatabase } from '../config/database';
import sequelize from '../config/database';
import { initializeModels, User } from '../models';
import { UserRole } from '../types/models';
import bcrypt from 'bcrypt';

/**
 * Script to create or promote an admin user
 * Usage: ts-node src/scripts/create-admin.ts [email] [password]
 */
const createAdmin = async () => {
    try {
        const email = process.argv[2];
        const password = process.argv[3];

        if (!email) {
            console.error('❌ Please provide an email address.');
            process.exit(1);
        }

        await connectDatabase();
        initializeModels(sequelize);

        let user = await User.findOne({ where: { email } });

        if (user) {
            console.log(`ℹ️ User ${email} already exists. Promoting to ADMIN...`);
            user.role = UserRole.ADMIN;
            await user.save();
            console.log(`✅ User ${email} promoted to ADMIN.`);
        } else {
            if (!password) {
                console.error('❌ User not found. Please provide a password to create a new admin.');
                process.exit(1);
            }

            console.log(`Creating new admin user: ${email}...`);
            const hashedPassword = await bcrypt.hash(password, 10);

            user = await User.create({
                email,
                name: 'Admin User',
                password: hashedPassword,
                role: UserRole.ADMIN,
                membership_tier: 'elite' as any,
                email_verified: true
            });

            console.log(`✅ Admin user ${email} created successfully.`);
        }

        await closeDatabase();
    } catch (error) {
        console.error('💥 Script failed:', error);
        process.exit(1);
    }
};

createAdmin();
