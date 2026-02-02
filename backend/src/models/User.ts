import { DataTypes, Model, Sequelize } from 'sequelize';
import { MembershipTier } from '../types/models';

export class User extends Model {
  public id!: string;
  public email!: string;
  public name!: string;
  public password!: string | null;
  public google_id?: string | null;
  public provider?: 'email' | 'google' | null;
  public profile_picture?: string | null;
  public is_oauth_user!: boolean;
  public membership_tier!: MembershipTier;
  public membership_expires_at?: Date;
  public phone_number?: string;
  public company_name?: string;
  public email_verified!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Static method to initialize the model
  public static initialize(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        google_id: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true,
        },
        provider: {
          type: DataTypes.ENUM('email', 'google'),
          allowNull: true,
        },
        profile_picture: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        is_oauth_user: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        membership_tier: {
          type: DataTypes.ENUM(...Object.values(MembershipTier)),
          allowNull: false,
          defaultValue: MembershipTier.FREE,
        },
        membership_expires_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        phone_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        company_name: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        email_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['email'],
          },
          {
            unique: true,
            fields: ['google_id'],
          },
        ],
      }
    );

    return User;
  }
}

export default User;