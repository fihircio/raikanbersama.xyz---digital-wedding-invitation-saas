import { DataTypes, Model, Sequelize } from 'sequelize';

export class ItineraryItem extends Model {
  public id!: string;
  public invitation_id!: string;
  public time!: string;
  public activity!: string;

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize): typeof ItineraryItem {
    ItineraryItem.init(
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
        time: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        activity: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'ItineraryItem',
        tableName: 'itinerary_items',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            fields: ['invitation_id'],
          },
        ],
      }
    );

    return ItineraryItem;
  }
}

export default ItineraryItem;