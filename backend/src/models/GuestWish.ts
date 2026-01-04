import { DataTypes, Model, Sequelize } from 'sequelize';

export class GuestWish extends Model {
  public id!: string;
  public invitation_id!: string;
  public name!: string;
  public message!: string;
  public created_at!: Date;

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize): typeof GuestWish {
    GuestWish.init(
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
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'GuestWish',
        tableName: 'guest_wishes',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['invitation_id'],
          },
          {
            fields: ['created_at'],
          },
        ],
      }
    );

    return GuestWish;
  }
}

export default GuestWish;