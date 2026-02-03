'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('coupons', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed'),
                allowNull: false,
                defaultValue: 'percentage',
            },
            discount_value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            affiliate_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'affiliates',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            max_uses: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            current_uses: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            expiry_date: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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

        await queryInterface.addIndex('coupons', ['code']);
        await queryInterface.addIndex('coupons', ['affiliate_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('coupons');
    },
};
