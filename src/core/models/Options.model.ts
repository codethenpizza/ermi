import {Column, DataType, Model, Table} from "sequelize-typescript"


@Table({
    tableName: 'options',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})

export default class OptionsModel extends Model<OptionsModel> {
    @Column({
        type: DataType.TEXT,
    })
    key: string;

    @Column({
        type: DataType.TEXT,
    })
    value: string;
}

export type IOption = {
    key: string;
    value?: string;
}
