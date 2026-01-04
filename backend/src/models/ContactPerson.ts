import { DataTypes, Model, Sequelize } from 'sequelize';

export class ContactPerson extends Model {
  public id!: string;
  public invitation_id!: string;
  public name!: string;
  public relation!: string;
  public phone!: string;

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize): typeof ContactPerson {
    ContactPerson.init(
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
        relation: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'ContactPerson',
        tableName: 'contact_persons',
        timestamps: false,
        underscored: true,
        indexes: [
          {
            fields: ['invitation_id'],
          },
        ],
      }
    );

    return ContactPerson;
  }
}

export default ContactPerson;