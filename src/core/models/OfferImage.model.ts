import {Column, ForeignKey, Model, Table} from "sequelize-typescript";
import Image from "@core/models/Image.model";
import Offer from "@core/models/Offer.model";
import {ImageToEntity} from "@core/models/types";

@Table({
    tableName: 'offer_image',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class OfferImage extends Model<OfferImage> implements IOfferImage {

    @ForeignKey(() => Image)
    @Column
    image_id: number;

    @ForeignKey(() => Offer)
    @Column
    offer_id: number;

    @Column({
        defaultValue: 0
    })
    position: number;

}

export interface IOfferImage extends ImageToEntity {
    id?: number;
    offer_id: number;
}
