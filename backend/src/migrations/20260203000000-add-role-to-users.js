'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'role', {
            type: Sequelize.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user',
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'role');
        // Drop the ENUM type as well if using PostgreSQL
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_users_role";');
    },
};
