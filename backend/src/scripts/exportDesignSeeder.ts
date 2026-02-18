import fs from 'fs';
import path from 'path';
import { connectDatabase, closeDatabase } from '../config/database';
import sequelize from '../config/database';
import { initializeModels, BackgroundImage } from '../models';
import logger from '../utils/logger';

/**
 * Script to export current BackgroundImage records from the database
 * and update the src/seeders/index.ts file.
 */
const exportDesignSeeder = async () => {
    try {
        // Guard: prevent running in production (would overwrite seeder with stale prod data)
        if (process.env.NODE_ENV === 'production') {
            logger.error('❌ sync-designs cannot run in production! This command is local-only.');
            logger.error('It would overwrite the seeder file with current prod DB data.');
            process.exit(1);
        }

        logger.info('Starting design seeder export process...');

        // Connect to database
        await connectDatabase();
        initializeModels(sequelize);

        // Fetch all designs
        const designs = await BackgroundImage.findAll({
            order: [['name', 'ASC']]
        });

        if (designs.length === 0) {
            logger.warn('No designs found in database to export.');
            await closeDatabase();
            return;
        }

        logger.info(`Found ${designs.length} designs. Formatting for seeder...`);

        // Format designs as code
        const formattedDesigns = designs.map(d => {
            const bg = d.toJSON();
            // Remove DB specific fields
            delete (bg as any).id;
            delete (bg as any).createdAt;
            delete (bg as any).updatedAt;

            return `    {
      name: ${JSON.stringify(bg.name)},
      url: ${JSON.stringify(bg.url)},
      thumbnail: ${JSON.stringify(bg.thumbnail)},
      category: ${JSON.stringify(bg.category)},
      theme: ${JSON.stringify(bg.theme)},
      primary_color: ${JSON.stringify(bg.primary_color)},
      isPremium: ${bg.isPremium},
      tags: ${JSON.stringify(bg.tags)},
      layout_settings: ${JSON.stringify(bg.layout_settings)},
    },`;
        }).join('\n');

        // Update index.ts
        const seederPath = path.resolve(__dirname, '../seeders/index.ts');
        let content = fs.readFileSync(seederPath, 'utf8');

        const beginMarker = '// BEGIN_BACKGROUND_IMAGES';
        const endMarker = '// END_BACKGROUND_IMAGES';

        const startIndex = content.indexOf(beginMarker);
        const endIndex = content.indexOf(endMarker);

        if (startIndex === -1 || endIndex === -1) {
            logger.error('Markers not found in index.ts. Please ensure BEGIN and END markers are present.');
            await closeDatabase();
            process.exit(1);
        }

        const newContent =
            content.substring(0, startIndex + beginMarker.length) +
            '\n' + formattedDesigns + '\n    ' +
            content.substring(endIndex);

        fs.writeFileSync(seederPath, newContent, 'utf8');
        logger.info(`Successfully updated seeder at ${seederPath} with ${designs.length} designs.`);

        await closeDatabase();
        process.exit(0);
    } catch (error) {
        logger.error('Error in exportDesignSeeder script:', error);
        process.exit(1);
    }
};

exportDesignSeeder();
