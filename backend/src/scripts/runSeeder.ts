
import { connectDatabase, closeDatabase } from '../config/database';
import sequelize from '../config/database';
import { initializeModels } from '../models';
import { seedSampleInvitations } from '../seeders/sampleInvitations';

const run = async () => {
    try {
        // 1. Connect
        await connectDatabase();

        // 2. Init Models
        initializeModels(sequelize);

        // 3. Run Seed
        await seedSampleInvitations();

        // 4. Close
        await closeDatabase();
        console.log('🏁 Seeder finished.');
    } catch (error) {
        console.error('💥 Runner failed:', error);
        process.exit(1);
    }
};

run();
