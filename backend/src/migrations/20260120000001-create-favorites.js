/**
 * Migration: Create favorites table
 * Allows users to save their favorite background images
 */

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('favorites', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            background_image_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'background_images',
                    key: 'id',
                },
                onDelete: 'CASCADE',
            },
            created_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });

        // Add unique constraint
        await queryInterface.addConstraint('favorites', {
            fields: ['user_id', 'background_image_id'],
            type: 'unique',
            name: 'unique_user_background',
        });

        // Add indexes
        await queryInterface.addIndex('favorites', ['user_id'], {
            name: 'idx_favorites_user_id',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('favorites');
    },
};
