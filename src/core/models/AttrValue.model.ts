import {
    AfterCreate,
    AfterDestroy,
    AfterUpdate,
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table
} from "sequelize-typescript"
import Attribute, {IAttribute} from "@core/models/Attribute.model";
import ProductVariant, {IProductVariant} from "@core/models/ProductVariant.model";
import {CreateOptions, InstanceDestroyOptions, InstanceUpdateOptions} from "sequelize";
import ProductVariantAttrHash from "@core/models/ProductVariantAttrHash.model";


@Table({
    tableName: 'attr_value',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class AttrValue extends Model<AttrValue> implements IAttrValue {
    id: number;

    @Column({
        allowNull: false,
        type: DataType.TEXT,
    })
    value: string;

    @ForeignKey(() => Attribute)
    @Column
    attr_id: number;

    @ForeignKey(() => ProductVariant)
    @Column
    product_variant_id: number;


    @BelongsTo(() => Attribute, 'attr_id')
    attribute: Attribute;

    @BelongsTo(() => ProductVariant)
    productVariant: ProductVariant;

    created_at: Date;
    updated_at: Date;

    @AfterUpdate
    static async hookAfterUpdate(instance: AttrValue, {transaction}: InstanceUpdateOptions): Promise<void> {
        // if (this.elasticProductService) {
        //     const productVariant = (await instance.reload({
        //         include: this.allIncludes,
        //         transaction,
        //         raw: true
        //     })) as unknown as Required<IProductVariant>;
        //
        //
        //     this.elasticProductService.update(productVariant);
        // }
        await ProductVariantAttrHash.updateHash(instance.product_variant_id, transaction);
    }

    @AfterDestroy
    static async hookAfterDestroy(instance: AttrValue, {transaction}: InstanceDestroyOptions): Promise<void> {
        // if (this.elasticProductService) {
        //     await this.elasticProductService.setAvailability(instance.id, false);
        // }
        await ProductVariantAttrHash.updateHash(instance.product_variant_id, transaction);
    }

    @AfterCreate
    static async hookAfterCreate(instance: AttrValue, {transaction}: CreateOptions): Promise<void> {
        // if (this.elasticProductService) {
        //     const productVariant = (ProductVariant.findByPk(
        //         attributes.id,
        //         {include: this.allIncludes, transaction}
        //     )) as unknown as Required<IProductVariant>;
        //
        //     this.elasticProductService.update(productVariant);
        // }
        await ProductVariantAttrHash.updateHash(instance.product_variant_id, transaction);
    }
}

export interface IAttrValue {
    id: number;
    value: string;
    attr_id: number;
    product_variant_id: number;
    attribute?: IAttribute;
    productVariant?: IProductVariant;
    created_at: Date;
    updated_at: Date;
}

export interface IAttrValueCreate extends Omit<IAttrValue, 'id' | 'attribute' | 'productVariant' | 'created_at' | 'updated_at'> {
}

export type IAttrValueUpdateData = {
    id?: string;
    value?: string;
    attr_id?: number;
    product_variant_id?: number;
}
