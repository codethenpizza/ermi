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
import Product, {IProduct} from "@core/models/Product.model";
import AttrValue, {IAttrValue} from "@core/models/AttrValue.model";
import Image, {IImage} from "@core/models/Image.model";
import ProductVariantImg, {IProductVariantImg} from "@core/models/ProductVariantImg.model";
import {Includeable, Transaction} from "sequelize";
import Attribute from "@core/models/Attribute.model";
import AttrType from "@core/models/AttrType.model";
import ProductCategory from "@core/models/ProductCategory.model";
import Offer, {IOffer} from "@core/models/Offer.model";
import {ElasticProductService} from "@core/services/elastic/ElasticProductService/ElasticProductService";
import {ImageToEntity} from "@core/models/types";
import {Transactionable} from "sequelize/types/lib/model";

@Table({
    tableName: 'product_variant',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ProductVariant extends Model<ProductVariant> implements IProductVariant {

    private static elasticProductService: ElasticProductService;
    id: number;
    @ForeignKey(() => Product)
    @Column({
        allowNull: false
    })
    product_id: number;
    @Column({
        unique: true,
        allowNull: false,
    })
    variant_code: string;
    @Column({
        type: DataType.TEXT
    })
    desc: string;
    @Column({
        defaultValue: false
    })
    is_available: boolean;
    @HasMany(() => AttrValue)
    attrs: IAttrValue[];
    @BelongsTo(() => Product)
    product: IProduct;
    @BelongsToMany(() => Image, () => ProductVariantImg)
    images: Image[];
    @HasMany(() => ProductVariantImg)
    productVariantImgs: ProductVariantImg[];
    @HasMany(() => Offer)
    offers: Offer[];
    created_at: Date;
    updated_at: Date;

    static getAllIncludes(): Includeable[] {
        return [
            {
                model: AttrValue,
                include: [{model: Attribute, include: [AttrType]}]
            },
            {model: Product, include: [ProductCategory]},
            Image,
            ProductVariantImg,
            {model: Offer, include: Offer.getFullIncludes()}
        ];
    }

    static setElasticProductService(elasticProductService: ElasticProductService): void {
        this.elasticProductService = elasticProductService;
    }

    static async updateEsProduct(id: number, transaction?: Transaction): Promise<void> {
        if (this.elasticProductService) {
            const productVariant = await ProductVariant.findByPk(id, {include: this.getAllIncludes(), transaction})
                .then(x => x.toJSON() as IProductVariant);

            await this.elasticProductService.update(productVariant);
        }
    }

    @AfterUpdate
    @AfterCreate
    static async hookAfterCreateAndUpdate(instance: ProductVariant, {transaction}: Transactionable): Promise<void> {
        await this.updateEsProduct(instance.id, transaction);
    }

    @AfterDestroy
    static async hookAfterDestroy(instance: ProductVariant, options: Transactionable): Promise<void> {
        if (this.elasticProductService) {
            await this.elasticProductService.setAvailability(instance.id, false);
        }
    }
};

export interface IProductVariant {
    id: number;
    product_id: number;
    variant_code: string;
    desc?: string;
    is_available?: boolean;
    product?: IProduct;
    attrs?: IAttrValue[];
    offers?: IOffer[];
    images?: IImage[];
    productVariantImgs?: IProductVariantImg[];
    created_at?: Date;
    updated_at?: Date;
}

export interface IProductVariantCreate extends Pick<IProductVariant, 'desc' | 'is_available' | 'product_id'> {
    productVariantImgs: ImageToEntity[];
    attrs: Pick<IAttrValue, 'attr_id' | 'value'>[];
    variant_code?: IProductVariant['variant_code'];
}
