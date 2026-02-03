import { DataTypes, Model, Sequelize } from 'sequelize';
import { MembershipTier, OrderStatus } from '../types/models';

export class Order extends Model {
    public id!: string;
    public user_id!: string;
    public invitation_id?: string;
    public amount!: number;
    public status!: OrderStatus;
    public plan_tier!: MembershipTier;
    public coupon_id?: string;
    public payment_id?: string;
    public payment_method?: string;
    public readonly created_at!: Date;
    public readonly updated_at!: Date;

    public static initialize(sequelize: Sequelize): typeof Order {
        Order.init(
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
                invitation_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'invitations',
                        key: 'id',
                    },
                },
                amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                status: {
                    type: DataTypes.ENUM(...Object.values(OrderStatus)),
                    allowNull: false,
                    defaultValue: OrderStatus.PENDING,
                },
                plan_tier: {
                    type: DataTypes.ENUM(...Object.values(MembershipTier)),
                    allowNull: false,
                },
                payment_id: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                payment_method: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                coupon_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'coupons',
                        key: 'id',
                    },
                },
            },
            {
                sequelize,
                modelName: 'Order',
                tableName: 'orders',
                timestamps: true,
                underscored: true,
            }
        );

        return Order;
    }
}

export default Order;
