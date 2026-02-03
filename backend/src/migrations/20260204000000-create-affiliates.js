'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('affiliates', {
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
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            business_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            business_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            social_link: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            referral_code: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            status: {
                type: Sequelize.ENUM('pending', 'active', 'rejected'),
                allowNull: false,
                defaultValue: 'pending',
            },
            earnings_total: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0.00,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.addIndex('affiliates', ['user_id']);
        await queryInterface.addIndex('affiliates', ['referral_code']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('affiliates');
    },
};
