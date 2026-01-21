import { DataTypes, Model, Sequelize } from 'sequelize';

export class RSVP extends Model {
  public id!: string;
  public invitation_id!: string;
  public guest_name!: string;
  public pax!: number;
  public is_attending!: boolean;
  public phone_number!: string;
  public message?: string;
  public slot?: string;
  public created_at!: Date;

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize): typeof RSVP {
    RSVP.init(
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
        guest_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        pax: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        is_attending: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        phone_number: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        slot: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'RSVP',
        tableName: 'rsvps',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            fields: ['invitation_id'],
          },
          {
            fields: ['is_attending'],
          },
        ],
      }
    );

    return RSVP;
  }
}

export default RSVP;