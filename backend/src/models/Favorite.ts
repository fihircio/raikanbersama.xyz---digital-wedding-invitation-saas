import { Model, DataTypes, Sequelize } from 'sequelize';

/**
 * Favorite Model
 * Represents a user's favorited background image
 */
export class Favorite extends Model {
    public id!: string;
    public user_id!: string;
    public background_image_id!: string;
    public readonly created_at!: Date;

    // Timestamps
    public readonly createdAt!: Date;

    /**
     * Initialize Favorite model
     */
    public static initialize(sequelize: Sequelize): typeof Favorite {
        Favorite.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                user_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: 'users',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                background_image_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: 'background_images',
                        key: 'id',
                    },
                    onDelete: 'CASCADE',
                },
                created_at: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                    field: 'created_at',
                },
            },
            {
                sequelize,
                tableName: 'favorites',
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: false,
                indexes: [
                    {
                        unique: true,
                        fields: ['user_id', 'background_image_id'],
                        name: 'unique_user_background',
                    },
                    {
                        fields: ['user_id'],
                        name: 'idx_favorites_user_id',
                    },
                ],
            }
        );

        return Favorite;
    }
}

export default Favorite;
