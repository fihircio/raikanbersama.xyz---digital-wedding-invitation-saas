'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Check if column already exists to avoid errors
        const tableInfo = await queryInterface.describeTable('affiliates');
        if (!tableInfo.commission_rate) {
            await queryInterface.addColumn('affiliates', 'commission_rate', {
                type: Sequelize.DECIMAL(5, 2),
                allowNull: false,
                defaultValue: 20.00,
            });
        }
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('affiliates', 'commission_rate');
    }
};
