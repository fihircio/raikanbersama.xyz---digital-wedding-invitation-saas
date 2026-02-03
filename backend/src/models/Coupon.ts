import { DataTypes, Model, Sequelize } from 'sequelize';
import { DiscountType } from '../types/models';
import { Affiliate } from './Affiliate';

export class Coupon extends Model {
    public id!: string;
    public code!: string;
    public discount_type!: DiscountType;
    public discount_value!: number;
    public affiliate_id!: string;
    public max_uses!: number;
    public current_uses!: number;
    public expiry_date!: Date;
    public is_active!: boolean;
    public affiliate?: Affiliate;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static initialize(sequelize: Sequelize): typeof Coupon {
        Coupon.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                code: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                },
                discount_type: {
                    type: DataTypes.ENUM(...Object.values(DiscountType)),
                    allowNull: false,
                    defaultValue: DiscountType.PERCENTAGE,
                },
                discount_value: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                affiliate_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'affiliates',
                        key: 'id',
                    },
                },
                max_uses: {
                    type: DataTypes.INTEGER,
                    allowNull: true,
                },
                current_uses: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                },
                expiry_date: {
                    type: DataTypes.DATE,
                    allowNull: true,
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    defaultValue: true,
                },
            },
            {
                sequelize,
                modelName: 'Coupon',
                tableName: 'coupons',
                timestamps: true,
                underscored: true,
            }
        );

        return Coupon;
    }
}

export default Coupon;
