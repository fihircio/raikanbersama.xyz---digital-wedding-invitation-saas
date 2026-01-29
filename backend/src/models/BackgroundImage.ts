import { DataTypes, Model, Sequelize } from 'sequelize';

export class BackgroundImage extends Model {
  public id!: string;
  public name!: string;
  public url!: string;
  public thumbnail!: string;
  public category!: string;
  public theme!: string;
  public primary_color!: string;
  public isPremium!: boolean;
  public tags!: string[];
  public layout_settings!: {
    cover_layout?: string;
    font_family?: string;
    overlay_opacity?: number;
  };
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

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
          type: DataTypes.STRING,
          allowNull: false,
        },
        theme: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'Classic',
        },
        primary_color: {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: 'White',
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
        layout_settings: {
          type: DataTypes.JSON,
          allowNull: true,
          defaultValue: {},
        },
      },
      {
        sequelize,
        modelName: 'BackgroundImage',
        tableName: 'background_images',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['category'],
          },
          {
            fields: ['theme'],
          },
          {
            fields: ['primary_color'],
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