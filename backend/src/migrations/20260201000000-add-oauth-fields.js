'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Make password nullable
        await queryInterface.changeColumn('users', 'password', {
            type: Sequelize.STRING,
            allowNull: true,
        });

        // Add google_id column
        await queryInterface.addColumn('users', 'google_id', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true,
        });

        // Add provider column
        await queryInterface.addColumn('users', 'provider', {
            type: Sequelize.ENUM('email', 'google'),
            allowNull: true,
        });

        // Add profile_picture column
        await queryInterface.addColumn('users', 'profile_picture', {
            type: Sequelize.TEXT,
            allowNull: true,
        });

        // Add is_oauth_user column
        await queryInterface.addColumn('users', 'is_oauth_user', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });

        // Create index on google_id for faster lookups
        await queryInterface.addIndex('users', ['google_id'], {
            unique: true,
            name: 'idx_users_google_id',
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove index on google_id
        await queryInterface.removeIndex('users', 'idx_users_google_id');

        // Remove is_oauth_user column
        await queryInterface.removeColumn('users', 'is_oauth_user');

        // Remove profile_picture column
        await queryInterface.removeColumn('users', 'profile_picture');

        // Remove provider column
        await queryInterface.removeColumn('users', 'provider');

        // Remove google_id column
        await queryInterface.removeColumn('users', 'google_id');

        // Make password not nullable again
        await queryInterface.changeColumn('users', 'password', {
            type: Sequelize.STRING,
            allowNull: false,
        });
    },
};
