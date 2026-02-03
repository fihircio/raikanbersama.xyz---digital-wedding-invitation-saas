import fs from 'fs';
import path from 'path';
import { connectDatabase, closeDatabase } from '../config/database';
import sequelize from '../config/database';
import { initializeModels, BackgroundImage, User } from '../models';
import fileStorageService, { FileType } from '../services/fileStorageService';
import logger from '../utils/logger';

/**
 * Script to upload local design images to S3 and register them in the database
 */
const uploadDesignImages = async () => {
    try {
        logger.info('Starting design image upload process...');

        // Connect to database
        await connectDatabase();
        initializeModels(sequelize);

        // Get an admin user for the upload context
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        const userId = adminUser ? adminUser.id : 'system-admin';

        // Path to public directory (root of the project)
        const publicDir = path.resolve(__dirname, '../../../public');

        // List of files to process
        const files = [
            { name: 'Islamic Elegant 01', filename: 'islamic_01.png', category: 'Islamic', theme: 'Islamic', tags: ['islamic', 'elegant'] },
            { name: 'Islamic Elegant 02', filename: 'islamic_02.png', category: 'Islamic', theme: 'Islamic', tags: ['islamic', 'elegant'] },
            { name: 'Islamic Elegant 03', filename: 'islamic_03.png', category: 'Islamic', theme: 'Islamic', tags: ['islamic', 'elegant'] },
            { name: 'Minimalist White 01', filename: 'minimal_01.png', category: 'Minimalist', theme: 'Minimalist', tags: ['minimal', 'white'] },
            { name: 'Modern Style 01', filename: 'modern_01.png', category: 'Modern', theme: 'Modern', tags: ['modern', 'clean'] },
            { name: 'Ramadan Mubarak 01', filename: 'ramadhan_01.png', category: 'Islamic', theme: 'Ramadan', tags: ['ramadan', 'islamic'] },
            { name: 'Ramadan Mubarak 02', filename: 'ramadhan_02.png', category: 'Islamic', theme: 'Ramadan', tags: ['ramadan', 'islamic'] },
            { name: 'Raya Celebration 01', filename: 'raya_01.png', category: 'Islamic', theme: 'Raya', tags: ['raya', 'islamic', 'eid'] },
            { name: 'Rustic Floral 01', filename: 'rustic_01.png', category: 'Rustic', theme: 'Rustic', tags: ['rustic', 'floral'] },
            { name: 'Rustic Floral 02', filename: 'rustic_02.png', category: 'Rustic', theme: 'Rustic', tags: ['rustic', 'floral'] },
            { name: 'Nature Scenery 01', filename: 'scenery_01.png', category: 'Scenery', theme: 'Nature', tags: ['scenery', 'nature'] },
            { name: 'Nature Scenery 02', filename: 'scenery_02.png', category: 'Scenery', theme: 'Nature', tags: ['scenery', 'nature'] },
            { name: 'Vintage Rose 01', filename: 'vintage_01.png', category: 'Vintage', theme: 'Vintage', tags: ['vintage', 'rose'] },
        ];

        for (const fileItem of files) {
            const filePath = path.join(publicDir, fileItem.filename);

            if (!fs.existsSync(filePath)) {
                logger.warn(`File not found: ${filePath}, skipping...`);
                continue;
            }

            // Check if already in database (by name)
            const existing = await BackgroundImage.findOne({ where: { name: fileItem.name } });
            if (existing) {
                logger.info(`Background image "${fileItem.name}" already exists, skipping upload...`);
                continue;
            }

            logger.info(`Uploading ${fileItem.filename} to S3...`);
            const buffer = fs.readFileSync(filePath);

            const uploadResult = await fileStorageService.uploadFile(
                buffer,
                FileType.BACKGROUND,
                userId,
                fileItem.filename
            );

            logger.info(`Registering ${fileItem.name} in database...`);
            await BackgroundImage.create({
                name: fileItem.name,
                url: uploadResult.url,
                thumbnail: uploadResult.thumbnails?.medium || uploadResult.url,
                category: fileItem.category,
                theme: fileItem.theme,
                primary_color: 'Varies',
                isPremium: true, // New designs set to premium by default
                tags: fileItem.tags,
                layout_settings: {
                    cover_layout: 'standard',
                    font_family: 'serif',
                    overlay_opacity: 0.3
                }
            } as any);

            logger.info(`Successfully processed ${fileItem.name}`);
        }

        logger.info('Design image upload process completed!');
        await closeDatabase();
        process.exit(0);
    } catch (error) {
        logger.error('Error in uploadDesignImages script:', error);
        process.exit(1);
    }
};

uploadDesignImages();
