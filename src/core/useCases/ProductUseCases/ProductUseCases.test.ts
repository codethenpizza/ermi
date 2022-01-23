import {
    IProductCreateData,
    IProductUpdateData,
    IProductVariantCreateData,
    IProductVariantUpdateData
} from "@core/useCases/ProductUseCases/types";
import {ATTR_TYPE_ID, ROOT_CAT_ID} from "../../../tests/constants";
import {sequelizeTs} from "@core/database";
import ProductCatsProduct from "@core/models/ProductCatsProduct.model";
import ProductCategory, {IProductCategory} from "@core/models/ProductCategory.model";
import Attribute, {IAttributeCreate} from "@core/models/Attribute.model";
import Image, {IImageCreate} from "@core/models/Image.model";
import AttrValue from "@core/models/AttrValue.model";
import ProductVariantImg from "@core/models/ProductVariantImg.model";
import {createMockProduct} from "../../../tests/helpers/createMockProduct";
import {productUseCases} from "@core/useCases";
import {elasticProductService} from "@core/services";

describe('Product use-cases', () => {

    test('should create product', async () => {
        const transaction = await sequelizeTs.transaction();

        const data: IProductCreateData = {
            name: 'test',
            cat_ids: [ROOT_CAT_ID],
        };
        const product = await productUseCases.createProduct(data, transaction);

        expect(product.id).not.toBeNull();

        const productCatsProduct = await ProductCatsProduct.findOne({where: {product_id: product.id}, transaction});

        expect(productCatsProduct.product_cat_id).toBe(ROOT_CAT_ID);

        await transaction.rollback();
    });

    test('should update product', async () => {
        const transaction = await sequelizeTs.transaction();

        const data: IProductCreateData = {
            name: 'test',
            cat_ids: [ROOT_CAT_ID],
        };
        let product = await productUseCases.createProduct(data, transaction);


        const catData: IProductCategory = {
            name: 'testCat',
            parent_id: ROOT_CAT_ID
        };
        const testCat = await ProductCategory.create(catData, {transaction});


        const newData1: IProductUpdateData = {
            id: product.id,
            name: 'test2',
            cat_ids: [testCat.id],
            desc: 'test desc',
        };
        product = await productUseCases.updateProduct(newData1, transaction);

        expect(product.cats.length).toBe(newData1.cat_ids.length);
        expect(product.cats[0].id).toBe(testCat.id);

        await transaction.rollback();
    });

    test('should create variant', async () => {
        const transaction = await sequelizeTs.transaction();


        const product = await createMockProduct(productUseCases, null, transaction);


        const attrData: IAttributeCreate = {
            name: 'testAttr',
            type_id: ATTR_TYPE_ID.STRING
        };
        const attr = await Attribute.create(attrData, {transaction});


        const imageData: IImageCreate = {
            name: 'test img',
            original_uri: 'https://via.placeholder.com/450'
        };
        const image = await Image.create(imageData, {transaction});

        const productVariantData: IProductVariantCreateData = {
            is_available: true,
            images: [{image_id: image.id}],
            attrs: [{attr_id: attr.id, value: 'test val'}],
        };
        const productVariant = await productUseCases.createVariant(productVariantData, product.id, transaction);

        expect(productVariant).not.toBeNull();

        const esProduct = await elasticProductService.getByID(productVariant.id);

        expect(esProduct).not.toBeNull();

        expect(esProduct.attrs[attr.slug]?.value).toBe(productVariantData.attrs[0]?.value);

        expect(esProduct.images[0]).toMatchObject(imageData);


        await elasticProductService.destroy(esProduct.id);
        await transaction.rollback();
    });

    test('should update variant', async () => {
        const transaction = await sequelizeTs.transaction();


        const productData: IProductCreateData = {
            name: 'test',
            cat_ids: [ROOT_CAT_ID],
        };
        const product = await productUseCases.createProduct(productData, transaction);


        let attrData: IAttributeCreate = {
            name: 'testAttr',
            type_id: ATTR_TYPE_ID.STRING
        };
        let attr = await Attribute.create(attrData, {transaction});


        let imageData: IImageCreate = {
            name: 'test img',
            original_uri: 'https://via.placeholder.com/450'
        };
        let image = await Image.create(imageData, {transaction});

        const productVariantData: IProductVariantCreateData = {
            is_available: true,
            images: [{image_id: image.id}],
            attrs: [{attr_id: attr.id, value: 'test val'}],
        };
        const originalProductVariant = await productUseCases.createVariant(productVariantData, product.id, transaction);


        // empty update - expect nothing will change
        let productVariantUpdateData: IProductVariantUpdateData = {
            id: originalProductVariant.id,
        };
        let newProductVariant = await productUseCases.updateVariant(productVariantUpdateData, transaction);

        expect(newProductVariant).toMatchObject(originalProductVariant);


        // update attrs and images
        attrData = {
            name: 'testAttr2',
            type_id: ATTR_TYPE_ID.STRING
        };
        attr = await Attribute.create(attrData, {transaction});

        imageData = {
            name: 'test img 2',
            original_uri: 'https://via.placeholder.com/550'
        };
        image = await Image.create(imageData, {transaction});

        const attrValue: IProductVariantUpdateData['attrs'][0] = {attr_id: attr.id, value: 'test val2'};
        productVariantUpdateData = {
            id: originalProductVariant.id,
            attrs: [attrValue],
            images: [{image_id: image.id}],
            is_available: false
        }
        newProductVariant = await productUseCases.updateVariant(productVariantUpdateData, transaction);

        expect(newProductVariant.is_available).toBe(productVariantUpdateData.is_available);

        expect(newProductVariant.attrs.length).toBe(productVariantUpdateData.attrs.length);
        expect(newProductVariant.images.length).toBe(productVariantUpdateData.images.length);

        const attrValues = await AttrValue.findAll({where: {product_variant_id: newProductVariant.id}, transaction});
        const productImages = await ProductVariantImg.findAll({
            where: {product_variant_id: newProductVariant.id},
            transaction
        });

        expect(attrValues.length).toBe(productVariantUpdateData.attrs.length);
        expect(productImages.length).toBe(productVariantUpdateData.images.length);


        const esProduct = await elasticProductService.getByID(newProductVariant.id);

        expect(esProduct.attrs[attr.slug].value).toBe(attrValue.value);
        expect(esProduct.images.length).toBe(productVariantUpdateData.images.length);
        expect(esProduct.images[0].id).toBe(image.id);


        await elasticProductService.destroy(esProduct.id);
        await transaction.rollback();
    });

});
