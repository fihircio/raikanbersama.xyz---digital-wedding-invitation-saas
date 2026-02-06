'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('affiliate_earnings', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            affiliate_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'affiliates',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            order_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            commission_rate: {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('pending', 'paid', 'cancelled'),
                allowNull: false,
                defaultValue: 'pending',
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

        await queryInterface.addIndex('affiliate_earnings', ['affiliate_id']);
        await queryInterface.addIndex('affiliate_earnings', ['order_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('affiliate_earnings');
    }
};
