import { DataTypes, Model, Sequelize } from 'sequelize';

export class BackgroundImage extends Model {
  public id!: string;
  public name!: string;
  public url!: string;
  public thumbnail!: string;
  public category!: 'popular' | 'minimalist' | 'elegant' | 'floral';
  public isPremium!: boolean;
  public tags!: string[];

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize): typeof BackgroundImage {
    BackgroundImage.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        thumbnail: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        category: {
          type: DataTypes.ENUM('popular', 'minimalist', 'elegant', 'floral'),
          allowNull: false,
        },
        isPremium: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        tags: {
          type: DataTypes.JSON,
          allowNull: false,
          defaultValue: [],
        },
      },
      {
        sequelize,
        modelName: 'BackgroundImage',
        tableName: 'background_images',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            fields: ['category'],
          },
          {
            fields: ['is_premium'],
          },
        ],
      }
    );

    return BackgroundImage;
  }
}

export default BackgroundImage;