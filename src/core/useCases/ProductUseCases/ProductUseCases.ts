import {
    IProductCreateData,
    IProductUpdateData,
    IProductVariantCreateData,
    IProductVariantUpdateData
} from "@core/useCases/ProductUseCases/types";
import ProductVariant, {IProductVariant, IProductVariantCreate} from "@core/models/ProductVariant.model";
import ProductVariantImg, {IProductVariantImg} from "@core/models/ProductVariantImg.model";
import {attrValueDiff, catRelationsDiff, imageRelationsDiff} from "@core/helpers/relationsDiff";
import {ImageToEntity} from "@core/models/types";
import {Op, Transaction} from "sequelize";
import Product, {IProduct, IProductCreate} from "@core/models/Product.model";
import ProductCatsProduct, {IProductCatsProduct} from "@core/models/ProductCatsProduct.model";
import AttrValue, {IAttrValueCreate} from "@core/models/AttrValue.model";
import {generateVariantCode} from "@core/helpers/utils";

export class ProductUseCases {

    async createProduct(data: IProductCreateData, transaction?: Transaction): Promise<IProduct> {
        const product: IProductCreate = {
            name: data.name,
            desc: data.desc,
            attr_set_id: data.attr_set_id,
            productCatsProduct: data.cat_ids.map(id => ({product_cat_id: id}))
        };

        return Product.create(product, {include: [ProductCatsProduct], transaction})
            .then(x => x.toJSON() as IProduct);
    }

    async updateProduct(data: IProductUpdateData, transaction?: Transaction): Promise<IProduct> {
        const product = await Product.findByPk(data.id, {
            include: [ProductCatsProduct],
            transaction
        });

        if (!product) {
            throw new Error(`Can't find product with id = ${data.id}`);
        }

        const {
            catIdsToCreate,
            catIdsToDestroy
        } = catRelationsDiff(data.cat_ids, product.productCatsProduct.map(x => x.product_cat_id));

        if (catIdsToDestroy.length) {
            await ProductCatsProduct.destroy({
                where: {
                    [Op.and]: {
                        product_cat_id: {[Op.in]: catIdsToDestroy},
                        product_id: product.id
                    }
                },
                transaction
            });
        }

        if (catIdsToCreate.length) {
            const catData: IProductCatsProduct[] = catIdsToCreate.map(id => ({
                product_cat_id: id,
                product_id: product.id
            }));
            await ProductCatsProduct.bulkCreate(catData, {transaction});
        }

        await product.update(data, {transaction});

        return product.reload({include: Product.getAllIncludes(), transaction})
            .then(x => x.toJSON() as IProduct);
    }

    async createVariant(data: IProductVariantCreateData, productID: number, transaction?: Transaction): Promise<IProductVariant> {

        const productVariantData: IProductVariantCreate = {
            product_id: productID,
            variant_code: data.variant_code || generateVariantCode(),
            desc: data.desc,
            is_available: data.is_available,
            attrs: data.attrs,
            productVariantImgs: data.images,
        };


        const productVariant = await ProductVariant.create(productVariantData, {
            include: ProductVariant.getAllIncludes(),
            transaction
        });

        return productVariant.reload({include: ProductVariant.getAllIncludes(), transaction})
            .then(x => x.toJSON() as IProductVariant);
    }

    async updateVariant(data: IProductVariantUpdateData, transaction?: Transaction): Promise<IProductVariant> {
        const productVariant = await ProductVariant.findByPk(data.id, {
            include: ProductVariant.getAllIncludes(),
            transaction
        });

        if (!productVariant) {
            throw new Error(`Can't find product variant with id = ${data.id}`);
        }

        const {
            imageIdsToCreate,
            imageIdsToDestroy
        } = imageRelationsDiff<ImageToEntity, IProductVariantImg>(data.images, productVariant.productVariantImgs);

        const {
            attrValuesToCreate,
            attrValueIdsToDestroy,
        } = attrValueDiff(data.attrs, productVariant.attrs);

        if (imageIdsToDestroy.length) {
            await ProductVariantImg.destroy({
                where: {
                    image_id: {[Op.in]: imageIdsToDestroy.map(x => x.image_id)},
                    product_variant_id: productVariant.id
                },
                transaction
            });

        }

        if (imageIdsToCreate.length) {
            const productVariantImgsData: Omit<IProductVariantImg, 'id'>[] =
                imageIdsToCreate.map(x => ({...x, product_variant_id: productVariant.id}));
            await ProductVariantImg.bulkCreate(productVariantImgsData, {transaction});
        }

        if (attrValueIdsToDestroy.length) {
            await AttrValue.destroy({
                where: {id: {[Op.in]: attrValueIdsToDestroy}},
                transaction
            });
        }

        if (attrValuesToCreate.length) {
            const attrValueData: IAttrValueCreate[] =
                attrValuesToCreate.map(x => ({...x, product_variant_id: productVariant.id}));
            await AttrValue.bulkCreate(attrValueData, {transaction});
        }

        return productVariant.update(data, {transaction})
            .then(x => x.toJSON() as IProductVariant);
    }

}
