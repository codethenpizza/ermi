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
import Product from "@models/Product.model";
import AttrValue, {IAttrValue, IAttrValueUpdateData} from "@models/AttrValue.model";
import Image, {IImage} from "@models/Image.model";
import ProductVariantImg, {IProductVariantImg} from "@models/ProductVariantImg.model";
import {CreateOptions, Includeable, InstanceDestroyOptions, InstanceUpdateOptions, Op, Transaction} from "sequelize";
import {EsProduct} from "@server/elastic/EsProducts";
import Attribute from "@models/Attribute.model";
import AttrType from "@models/AttrType.model";
import ProductCategory from "@models/ProductCategory.model";

@Table({
    tableName: 'product_variant',
    updatedAt: 'updated_at',
    createdAt: 'created_at'
})
export default class ProductVariant extends Model<ProductVariant> {
    @ForeignKey(() => Product)
    @Column({
        allowNull: false
    })
    product_id: number;

    @Column({
        unique: true,
        allowNull: false,
    })
    vendor_code: string;

    @Column({
        type: DataType.TEXT
    })
    desc: string;

    @Column({
        allowNull: false,
        type: DataType.DECIMAL
    })
    price: number;

    @Column({
        type: DataType.DECIMAL
    })
    price_discount: number;

    @Column({
        type: DataType.FLOAT
    })
    weight: number;

    @Column({
        type: DataType.FLOAT,
        defaultValue: 0
    })
    in_stock_qty: number;

    @Column({
        defaultValue: false
    })
    is_available: boolean;

    @Column({
        defaultValue: false
    })
    is_discount: boolean;

    @HasMany(() => AttrValue)
    attrs: AttrValue[];

    @BelongsTo(() => Product)
    product: Product;

    @BelongsToMany(() => Image, () => ProductVariantImg)
    images: Image[];

    @HasMany(() => ProductVariantImg)
    productVariantImgs: Partial<IProductVariantImg>[];


    @AfterUpdate
    static async hookAfterUpdate(instance: ProductVariant, {transaction}: InstanceUpdateOptions): Promise<void> {
        instance = await instance.reload({
            include: this.fullIncludes(),
            transaction
        });
        const esProduct = new EsProduct();
        await esProduct.updateDocument(instance);
    }

    @AfterDestroy
    static async hookAfterDestroy(instance: ProductVariant, options: InstanceDestroyOptions): Promise<void> {
        const esProduct = new EsProduct();
        await esProduct.es.update({id: instance.id, is_available: false});
    }

    @AfterCreate
    static async hookAfterCreate(attributes: ProductVariant, {transaction}: CreateOptions): Promise<void> {
        const instance = await ProductVariant.findByPk(attributes.id, {include: this.fullIncludes(), transaction});
        const esProduct = new EsProduct();
        await esProduct.updateDocument(instance);
    }

    static async createOrUpdate(variant: IProductVariantUpdateData, transaction: Transaction): Promise<number> {
        if (variant.id) {
            await this.updateAttrs(variant, transaction);

            await this.updateImages(variant, transaction);

            delete variant.attrs;
            await ProductVariant.update(variant, {where: {id: variant.id}, transaction, individualHooks: true});

            return variant.id
        } else {
            const {id} = await ProductVariant.create(variant, {transaction});
            return id
        }
    }

    static fullIncludes(): Includeable[] {
        return [
            {
                model: AttrValue,
                include: [{model: Attribute, include: [AttrType]}]
            },
            {model: Product, include: [ProductCategory]},
            Image
        ];
    }


    private static async updateAttrs(variant: IProductVariantUpdateData, transaction: Transaction) {
        const attrs = [...variant.attrs].map(x => ({
            ...x,
            product_variant_id: variant.id
        }));
        const attrValuesToDelete = await AttrValue.findAll({
            where: {
                product_variant_id: variant.id,
                attr_id: {[Op.notIn]: attrs.map(({attr_id}) => attr_id)}
            }
        });
        await AttrValue.destroy({where: {id: {[Op.in]: attrValuesToDelete.map(x => x.id)}}});
        await AttrValue.bulkCreate(attrs, {transaction, updateOnDuplicate: ["value"]});
    }

    private static async updateImages(variant: IProductVariantUpdateData, transaction: Transaction) {
        const productVariantImgToDelete = await ProductVariantImg.findAll({
            where: {
                product_variant_id: variant.id,
                image_id: {[Op.notIn]: variant.images.map(x => x.id)}
            }
        })

        await ProductVariantImg.destroy({
            where: {
                product_variant_id: variant.id,
                image_id: {
                    [Op.in]: productVariantImgToDelete.map(x => x.image_id)
                }
            }, transaction
        });

        const images = variant.images.map(({id}, position) => ({
            image_id: id,
            product_variant_id: variant.id,
            position
        }));

        await ProductVariantImg.bulkCreate(images, {transaction, updateOnDuplicate: ["position"]});
    }
};

export type IProductVariant = {
    id?: number;
    product_id?: number;
    vendor_code: string;
    desc?: string;
    price: number;
    price_discount?: number;
    weight?: number;
    in_stock_qty?: number;
    is_available?: boolean;
    is_discount?: boolean;
    attrs: IAttrValue[]
    images?: IImage[];
    productVariantImgs?: Partial<IProductVariantImg>[];
}

export type IProductVariantUpdateData = {
    id?: number;
    product_id?: number;
    vendor_code?: string;
    desc?: string;
    price?: number;
    price_discount?: number;
    weight?: number;
    in_stock_qty?: number;
    is_available?: boolean;
    is_discount?: boolean;
    attrs: IAttrValueUpdateData[];
    images?: IImage[];
}
