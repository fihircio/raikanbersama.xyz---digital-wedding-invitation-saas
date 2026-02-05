import { DataTypes, Model, Sequelize } from 'sequelize';
import { AffiliateStatus } from '../types/models';

export class Affiliate extends Model {
    public id!: string;
    public user_id!: string;
    public business_name!: string;
    public business_type!: string;
    public social_link!: string;
    public referral_code!: string;
    public status!: AffiliateStatus;
    public earnings_total!: number;
    public commission_rate!: number;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static initialize(sequelize: Sequelize): typeof Affiliate {
        Affiliate.init(
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
                },
                business_name: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                business_type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                social_link: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                referral_code: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    unique: true,
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(AffiliateStatus)),
                    allowNull: false,
                    defaultValue: AffiliateStatus.PENDING,
                },
                earnings_total: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                    defaultValue: 0,
                },
                commission_rate: {
                    type: DataTypes.DECIMAL(5, 2),
                    allowNull: false,
                    defaultValue: 20.00,
                },
            },
            {
                sequelize,
                modelName: 'Affiliate',
                tableName: 'affiliates',
                timestamps: true,
                underscored: true,
            }
        );

        return Affiliate;
    }
}

export default Affiliate;
