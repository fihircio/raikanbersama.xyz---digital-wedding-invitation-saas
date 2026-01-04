import { DataTypes, Model, Sequelize } from 'sequelize';

export class Gallery extends Model {
  public id!: string;
  public invitation_id!: string;
  public image_url!: string;
  public caption?: string;
  public display_order!: number;

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize): typeof Gallery {
    Gallery.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        invitation_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'invitations',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        image_url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        caption: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        display_order: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: 'Gallery',
        tableName: 'gallery',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            fields: ['invitation_id'],
          },
          {
            fields: ['display_order'],
          },
        ],
      }
    );

    return Gallery;
  }
}

export default Gallery;