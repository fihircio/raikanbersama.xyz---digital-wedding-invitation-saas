import { DataTypes, Model, Sequelize } from 'sequelize';

export enum EarningStatus {
    PENDING = 'pending',
    PAID = 'paid',
    CANCELLED = 'cancelled'
}

export class AffiliateEarning extends Model {
    public id!: string;
    public affiliate_id!: string;
    public order_id!: string;
    public amount!: number;
    public commission_rate!: number;
    public status!: EarningStatus;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static initialize(sequelize: Sequelize): typeof AffiliateEarning {
        AffiliateEarning.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                affiliate_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: 'affiliates',
                        key: 'id',
                    },
                },
                order_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: 'orders',
                        key: 'id',
                    },
                },
                amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                commission_rate: {
                    type: DataTypes.DECIMAL(5, 2),
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(EarningStatus)),
                    allowNull: false,
                    defaultValue: EarningStatus.PENDING,
                },
            },
            {
                sequelize,
                modelName: 'AffiliateEarning',
                tableName: 'affiliate_earnings',
                timestamps: true,
                underscored: true,
            }
        );

        return AffiliateEarning;
    }
}

export default AffiliateEarning;
