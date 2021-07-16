import {Column, DataType, Model, Table} from "sequelize-typescript";

@Table({
    tableName: 'migration',
    timestamps: false
})
export default class Migration extends Model<Migration> {

    @Column({
        allowNull: false,
        primaryKey: true,
    })
    name: string;

    @Column({
        allowNull: false,
        unique: true,
        type: DataType.BIGINT,
    })
    timestamp: number;

    @Column({
        allowNull: false,
        type: DataType.BIGINT
    })
    lastRun: number;

}
