import {offerUseCases, productUseCases} from "@core/useCases";
import {createMockProductVariant} from "../../../tests/helpers/createMockProductVariant";
import {sequelizeTs} from "@core/database";
import {IOfferCreateData, IOfferCreateProductData, IOfferUpdateData} from "@core/useCases/OfferUseCases/types";
import {createMockVendor} from "../../../tests/helpers/createMockVendor";
import {getRandomNumber} from "../../../tests/helpers/utils";
import {IProductCreateData, IProductVariantCreateData} from "@core/useCases/ProductUseCases/types";
import {createMockAttr} from "../../../tests/helpers/createMockAttr";
import {ATTR_TYPE_ID, ROOT_CAT_ID} from "../../../tests/constants";
import {elasticProductService, offerPriorityService} from "@core/services";
import {createMockProduct} from "../../../tests/helpers/createMockProduct";
import Attribute, {IAttributeCreate} from "@core/models/Attribute.model";
import {ATTR_BRAND} from "@core/helpers/productConstants";
import {OfferPriorityService} from "@core/services/catalog/OfferPriorityService";
import {CATALOG_PRIORITY_DEFAULT_VALUE} from "@core/services/catalog/constants";
import {Supplier} from "../../../modules/suppliers/interfaces/Supplier";
import {IVendorSaleMapItem} from "@core/services/catalog/types";
import Offer from "@core/models/Offer.model";

describe('Offer use-cases', () => {

    test('should create offer by product variant id', async () => {
        const transaction = await sequelizeTs.transaction();

        const productVariant = await createMockProductVariant(productUseCases, null, transaction);

        const vendor = await createMockVendor(null, transaction);

        const data: IOfferCreateData = {
            is_available: true,
            images: [],
            price: 123,
            vendor_id: vendor.id,
            vendor_code: getRandomNumber().toString(),
            in_stock_qty: 10,
            discount_price: null,
            stock: '[]',
        };

        const offer = await offerUseCases.create(data, productVariant.id, undefined, transaction);

        expect(offer).not.toBeNull();

        const esProduct = await elasticProductService.getByID(productVariant.id);

        expect(esProduct.offers[0].in_stock_qty).toBe(data.in_stock_qty);


        await elasticProductService.destroy(esProduct.id);
        await transaction.rollback();
    });

    test('should create offer by attrs hash', async () => {
        const transaction = await sequelizeTs.transaction();

        const attrs = await Promise.all([createMockAttr(transaction), createMockAttr(transaction)]);
        const attrValues: IProductVariantCreateData['attrs'] = attrs.map(x => ({
            attr_id: x.id,
            value: getRandomNumber().toString(),
        }));

        const productVariantData: IProductVariantCreateData = {
            images: [],
            attrs: [...attrValues],
        };
        const productVariant = await createMockProductVariant(productUseCases, productVariantData, transaction);

        const vendor = await createMockVendor(null, transaction);

        const data: IOfferCreateData = {
            is_available: true,
            images: [],
            price: 123,
            vendor_id: vendor.id,
            vendor_code: getRandomNumber().toString(),
            in_stock_qty: 10,
            stock: '[]',
        };


        const productData: IOfferCreateProductData = {
            name: 'Test prod',
            cat_ids: [ROOT_CAT_ID],
            productVariant: {
                images: [],
                attrs: productVariant.attrs
            }
        };
        const offer = await offerUseCases.create(data, productData, null, transaction);

        expect(offer).not.toBeNull();

        const esProduct = await elasticProductService.getByID(productVariant.id);

        expect(esProduct.offers[0].vendor_code).toBe(data.vendor_code);


        await elasticProductService.destroy(esProduct.id);
        await transaction.rollback();
    });

    test('should create offer and product variant by product name', async () => {
        const transaction = await sequelizeTs.transaction();

        const PRODUCT_SEARCH_SUBSTR = 'productEWQ';
        const productMockData: IProductCreateData = {
            cat_ids: [ROOT_CAT_ID],
            name: `Mock ${PRODUCT_SEARCH_SUBSTR} #${getRandomNumber()}`
        };
        const product = await createMockProduct(productUseCases, productMockData, transaction);

        const vendor = await createMockVendor(null, transaction);

        const data: IOfferCreateData = {
            is_available: true,
            images: [],
            price: 123,
            vendor_id: vendor.id,
            vendor_code: getRandomNumber().toString(),
            in_stock_qty: 10,
            stock: '[]',
        };

        const productData: IOfferCreateProductData = {
            name: PRODUCT_SEARCH_SUBSTR,
            cat_ids: [ROOT_CAT_ID],
            productVariant: {
                images: [],
                attrs: []
            }
        };
        const offer = await offerUseCases.create(data, productData, null, transaction);

        expect(offer).not.toBeNull();

        const esProduct = await elasticProductService.getByID(offer.product_variant_id);

        expect(esProduct.product_id).toBe(product.id);

        expect(esProduct.offers[0].vendor_code).toBe(data.vendor_code);


        await elasticProductService.destroy(esProduct.id);
        await transaction.rollback();
    });

    test('should update offer by id and vendor data', async () => {
        const transaction = await sequelizeTs.transaction();

        const productVariant = await createMockProductVariant(productUseCases, null, transaction);

        const vendor = await createMockVendor(null, transaction);

        const data: IOfferCreateData = {
            is_available: true,
            images: [],
            price: 123,
            vendor_id: vendor.id,
            vendor_code: getRandomNumber().toString(),
            in_stock_qty: 10,
            stock: '[]',
        };

        const offer = await offerUseCases.create(data, productVariant.id, null, transaction);


        const newData: IOfferUpdateData = {
            ...data,
            in_stock_qty: 5,
            id: offer.id
        };

        await offerUseCases.update(newData, transaction);

        let esProduct = await elasticProductService.getByID(offer.product_variant_id);

        expect(esProduct.offers.length).toBe(1);

        expect(esProduct.offers[0].in_stock_qty).toBe(newData.in_stock_qty);


        delete newData.id;
        newData.in_stock_qty = 0;

        await offerUseCases.update(newData, transaction);

        esProduct = await elasticProductService.getByID(offer.product_variant_id);

        expect(esProduct.offers.length).toBe(1);

        expect(esProduct.offers[0].in_stock_qty).toBe(newData.in_stock_qty);


        await elasticProductService.destroy(esProduct.id);
        await transaction.rollback();
    });

    test('should create or update offer', async () => {
        const transaction = await sequelizeTs.transaction();

        const productVariant = await createMockProductVariant(productUseCases, null, transaction);

        const vendor = await createMockVendor(null, transaction);

        const data: IOfferCreateData = {
            is_available: true,
            images: [],
            price: 123,
            vendor_id: vendor.id,
            vendor_code: getRandomNumber().toString(),
            in_stock_qty: 10,
            stock: '[]',
        };

        const spyUpdate = jest.spyOn(offerUseCases, 'update');
        const spyCreate = jest.spyOn(offerUseCases, 'create');

        await offerUseCases.updateOrCreate(data, productVariant.id, null, transaction);
        await offerUseCases.updateOrCreate(data, productVariant.id, null, transaction);

        expect(spyCreate.mock.calls.length).toBe(1);
        expect(spyUpdate.mock.calls.length).toBe(2);


        await elasticProductService.destroy(productVariant.id);
        await transaction.rollback();
    });

    test('should set priority', async () => {
        const transaction = await sequelizeTs.transaction();


        const attr = await Attribute.create({name: ATTR_BRAND, type_id: ATTR_TYPE_ID.STRING} as IAttributeCreate);

        const brandName = 'TestBrand';

        const productVariantData: IProductVariantCreateData = {
            images: [],
            attrs: [{attr_id: attr.id, value: brandName}],
            is_available: true,
        };
        const productVariant = await createMockProductVariant(productUseCases, productVariantData, transaction);

        const vendorName = 'TestVendor';
        const vendorName2 = 'TestVendor2';
        const vendor = await createMockVendor({name: vendorName}, transaction);
        const vendor2 = await createMockVendor({name: vendorName2}, transaction);

        const mockPriorityMap: Record<Supplier['name'], IVendorSaleMapItem> = {
            [vendorName]: {
                [brandName]: 0.2
            },
            [vendorName2]: {
                [brandName]: 0.5
            }
        };

        const mockOfferPriorityService = new OfferPriorityService(mockPriorityMap, CATALOG_PRIORITY_DEFAULT_VALUE);

        Offer.setOfferPriorityService(mockOfferPriorityService);

        const data: IOfferCreateData = {
            is_available: true,
            images: [],
            price: 123,
            vendor_id: vendor.id,
            vendor_code: getRandomNumber().toString(),
            in_stock_qty: 10,
            stock: '[]',
        };
        const offer = await offerUseCases.create(data, productVariant.id, null, transaction);

        const data2: IOfferCreateData = {
            is_available: true,
            images: [],
            price: 123,
            vendor_id: vendor2.id,
            vendor_code: getRandomNumber().toString(),
            in_stock_qty: 10,
            stock: '[]',
        };
        const offer2 = await offerUseCases.create(data2, productVariant.id, null, transaction);

        const esProduct = await elasticProductService.getByID(offer.product_variant_id);

        expect(esProduct.offers.length).toBe(2);
        expect(esProduct.offers.find(x => Boolean(x.priority)).id).toBe(offer2.id);

        Offer.setOfferPriorityService(offerPriorityService);
        await elasticProductService.destroy(productVariant.id);
        await transaction.rollback();
    });
});
