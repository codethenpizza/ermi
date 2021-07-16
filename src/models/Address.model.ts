import {Column, HasMany, Model, Table} from "sequelize-typescript";
import UserAddress from "@models/UserAddress.model";
import PickupPoint from "@models/PickupPoint.model";

@Table({
    tableName: 'address',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Address extends Model<Address> {

    @Column
    fields: string;

    @HasMany(() => UserAddress)
    userAddresses?: UserAddress[];

    @HasMany(() => PickupPoint)
    pickupPoints?: PickupPoint[];

}

export class IAddress {
    fields: string;
}
