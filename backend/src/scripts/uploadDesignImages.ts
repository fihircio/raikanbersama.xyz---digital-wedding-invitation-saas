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
        logger.info('Starting dynamic design image upload process...');

        // Connect to database
        await connectDatabase();
        initializeModels(sequelize);

        // Get an admin user for the upload context
        const adminUser = await User.findOne({ where: { role: 'admin' } });
        const userId = adminUser ? adminUser.id : 'system-admin';

        // Specific path for design uploads - search root and backend parent
        let designDir = path.resolve(process.cwd(), 'public/design');

        if (!fs.existsSync(designDir)) {
            designDir = path.resolve(process.cwd(), '../public/design');
        }

        if (!fs.existsSync(designDir)) {
            logger.error(`Design directory not found. Please ensure files are placed in public/design/`);
            process.exit(1);
        }

        const files = fs.readdirSync(designDir).filter(f =>
            f.toLowerCase().endsWith('.png') ||
            f.toLowerCase().endsWith('.jpg') ||
            f.toLowerCase().endsWith('.jpeg')
        );

        if (files.length === 0) {
            logger.warn('No design files found in public/design. Exiting...');
            process.exit(0);
        }

        logger.info(`Found ${files.length} design files to process.`);

        for (const filename of files) {
            const filePath = path.join(designDir, filename);

            // Generate a readable name from filename (e.g. floral_01.png -> Floral 01)
            let rawName = filename.split('.')[0]
                .split(/[-_]/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            let finalName = rawName;

            // Name Conflict Mitigation: Check if already in database
            let count = 1;
            while (await BackgroundImage.findOne({ where: { name: finalName } })) {
                logger.info(`Design name "${finalName}" already exists. Trying a variation...`);
                finalName = `${rawName} (v${++count})`;
            }

            logger.info(`Uploading ${filename} as "${finalName}" to S3...`);
            const buffer = fs.readFileSync(filePath);

            const uploadResult = await fileStorageService.uploadFile(
                buffer,
                FileType.BACKGROUND,
                userId,
                filename
            );

            // Determine theme/category from filename prefix if possible
            const prefix = filename.split(/[-_]/)[0].toLowerCase();
            const categoryMap: Record<string, string> = {
                'floral': 'Floral',
                'islamic': 'Islamic',
                'minimal': 'Minimalist',
                'modern': 'Modern',
                'ramadhan': 'Islamic',
                'raya': 'Islamic',
                'rustic': 'Rustic',
                'traditional': 'Traditional',
                'vintage': 'Vintage',
                'watercolor': 'Watercolor'
            };

            const themeMap: Record<string, string> = {
                'ramadhan': 'Ramadan',
                'raya': 'Raya'
            };

            const category = categoryMap[prefix] || 'Modern';
            const theme = themeMap[prefix] || category;

            logger.info(`Registering ${finalName} in database...`);
            await BackgroundImage.create({
                name: finalName,
                url: uploadResult.url,
                thumbnail: uploadResult.thumbnails?.medium || uploadResult.url,
                category: category,
                theme: theme,
                primary_color: 'Varies',
                isPremium: true,
                tags: [category.toLowerCase(), theme.toLowerCase(), 'new'],
                layout_settings: {
                    cover_layout: 'standard',
                    font_family: 'serif',
                    overlay_opacity: 0.3
                }
            } as any);

            logger.info(`Successfully processed ${finalName}`);
        }

        logger.info('Design image upload process completed! Starting cleanup...');

        // Automated Cleanup: Delete the public/design folder
        fs.rmSync(designDir, { recursive: true, force: true });
        logger.info(`Deleted local design directory: ${designDir}`);

        await closeDatabase();
        process.exit(0);
    } catch (error) {
        logger.error('Error in uploadDesignImages script:', error);
        process.exit(1);
    }
};

uploadDesignImages();
