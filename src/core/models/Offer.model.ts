import {
    AfterCreate,
    AfterDestroy,
    AfterUpdate,
    BelongsTo,
    BelongsToMany,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table
} from "sequelize-typescript";
import ProductVariant, {IProductVariant} from "@core/models/ProductVariant.model";
import Image, {IImage} from "@core/models/Image.model";
import Vendor from "@core/models/Vendor.model";
import OfferImage, {IOfferImage} from "@core/models/OfferImage.model";
import {ImageToEntity} from "@core/models/types";
import {Includeable} from "sequelize";
import {ToNumber} from "@core/helpers/decorators";
import {Transactionable} from "sequelize/types/lib/model";
import {OfferPriorityService} from "@core/services/catalog/OfferPriorityService";

@Table({
    tableName: 'offer',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class Offer extends Model<Offer> implements IOffer {

    private static offerPriorityService: OfferPriorityService;
    @ForeignKey(() => ProductVariant)
    @Column
    product_variant_id: number;
    @ForeignKey(() => Vendor)
    @Column
    vendor_id: number;
    @Column({
        allowNull: false
    })
    vendor_code: string;
    @ToNumber
    @Column({
        allowNull: false,
        type: DataType.DECIMAL(10, 2)
    })
    price: number;
    @ToNumber
    @Column({
        type: DataType.DECIMAL(10, 2)
    })
    discount_price?: number;
    @Column({
        allowNull: false
    })
    in_stock_qty: number;
    @Column({
        defaultValue: true
    })
    is_available: boolean;
    @Column({
        type: DataType.JSON
    })
    stock: string;
    @Column({
        defaultValue: false
    })
    priority: boolean;
    @BelongsToMany(() => Image, () => OfferImage)
    images?: IImage[];
    @HasMany(() => OfferImage)
    offerImages?: IOfferImage[];
    @BelongsTo(() => ProductVariant)
    productVariant?: IProductVariant;

    static getFullIncludes = (): Includeable[] => [
        Image,
        OfferImage
    ];

    static setOfferPriorityService(offerPriorityService: OfferPriorityService) {
        this.offerPriorityService = offerPriorityService;
    }

    @AfterUpdate
    @AfterDestroy
    @AfterCreate
    static async updateEsProduct(instance: Offer, {transaction}: Transactionable): Promise<void> {
        await this.offerPriorityService.updateOffersPriority(instance.product_variant_id, transaction);
        await ProductVariant.updateEsProduct(instance.product_variant_id, transaction);
    }

}

export interface IOffer {
    id?: number;
    product_variant_id: number;
    vendor_id: number;
    vendor_code: string;
    price: number;
    discount_price?: number;
    in_stock_qty: number;
    is_available: boolean;
    images?: IImage[];
    productVariant?: IProductVariant;
    offerImages?: IOfferImage[];
    stock: string;
    priority?: boolean;
}

export interface IOfferCreate extends Omit<IOffer, 'id' | 'images' | 'offerImages'> {
    offerImages: ImageToEntity[];
}
