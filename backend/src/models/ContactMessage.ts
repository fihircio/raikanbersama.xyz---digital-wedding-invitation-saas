import { DataTypes, Model, Sequelize } from 'sequelize';
import { ContactMessageStatus } from '../types/models';

export class ContactMessage extends Model {
    public id!: string;
    public name!: string;
    public email!: string;
    public subject!: string;
    public message!: string;
    public status!: ContactMessageStatus;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static initialize(sequelize: Sequelize): typeof ContactMessage {
        ContactMessage.init(
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
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                subject: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                message: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(ContactMessageStatus)),
                    allowNull: false,
                    defaultValue: ContactMessageStatus.NEW,
                },
            },
            {
                sequelize,
                modelName: 'ContactMessage',
                tableName: 'contact_messages',
                timestamps: true,
                underscored: true,
            }
        );

        return ContactMessage;
    }
}

export default ContactMessage;
