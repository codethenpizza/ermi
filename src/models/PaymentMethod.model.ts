import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'payment_method',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class PaymentMethod extends Model<PaymentMethod> {

    @Column({
        allowNull: false,
        unique: true
    })
    name: string;

    @Column({
        allowNull: false,
        unique: true
    })
    strategy: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @Column({
        defaultValue: true
    })
    enabled: boolean;

}
