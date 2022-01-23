import {IVendor, IVendorCreate} from "@core/models/Vendor.model";
import {createMockVendor} from "../../../tests/helpers/createMockVendor";
import Offer, {IOffer} from "@core/models/Offer.model";
import ProductVariant, {IProductVariant} from "@core/models/ProductVariant.model";
import {createMockProductVariant} from "../../../tests/helpers/createMockProductVariant";
import {catalogUseCases, offerUseCases, productUseCases} from "@core/useCases";
import {IProductVariantCreateData} from "@core/useCases/ProductUseCases/types";
import Attribute, {IAttributeCreate} from "@core/models/Attribute.model";
import {ATTR_BRAND} from "@core/helpers/productConstants";
import {ATTR_TYPE_ID} from "../../../tests/constants";
import {createMockOffer} from "../../../tests/helpers/createMockOffer";
import {Op} from "sequelize";
import Product from "@core/models/Product.model";
import AttrValue from "@core/models/AttrValue.model";
import "@core/database";
import {Elastic} from "@core/services/elastic/types";
import {Supplier} from "../../../modules/suppliers/interfaces/Supplier";
import {IVendorSaleMapItem} from "@core/services/catalog/types";
import {OfferPriorityService} from "@core/services/catalog/OfferPriorityService";
import {CATALOG_PRIORITY_DEFAULT_VALUE} from "@core/services/catalog/constants";
import {offerPriorityService} from "@core/services";

describe('Catalog use-cases', () => {

    let vendor: IVendor;
    let vendor2: IVendor;
    let productVariant: IProductVariant;
    let productVariant2: IProductVariant;
    let offer: IOffer;
    let offer2: IOffer;
    let offer3: IOffer;
    let offer4: IOffer;

    let attrBrand: Attribute;
    let attrET: Attribute;

    const attrBrandValue = 'TestBrand';
    const attrBrandValue2 = 'TestBrand2';
    const attrETValue = 40;
    const attrETValue2 = 30;

    beforeAll(async () => {
        // create catalog data
        const vendorData: IVendorCreate = {name: 'TestVendor'};
        const vendorData2: IVendorCreate = {name: 'TestVendor2'};
        vendor = await createMockVendor(vendorData);
        vendor2 = await createMockVendor(vendorData2);

        attrBrand = await Attribute.create({name: ATTR_BRAND, type_id: ATTR_TYPE_ID.STRING} as IAttributeCreate);
        const attrETName = 'et';
        attrET = await Attribute.create({name: attrETName, type_id: ATTR_TYPE_ID.DECIMAL} as IAttributeCreate);

        const productVariantData: IProductVariantCreateData = {
            images: [],
            attrs: [
                {attr_id: attrBrand.id, value: attrBrandValue},
                {
                    attr_id: attrET.id,
                    value: attrETValue.toString(10)
                }
            ],
            is_available: true,
        };
        productVariant = await createMockProductVariant(productUseCases, productVariantData);

        const productVariantData2: IProductVariantCreateData = {
            images: [],
            attrs: [
                {attr_id: attrBrand.id, value: attrBrandValue2},
                {
                    attr_id: attrET.id,
                    value: attrETValue2.toString(10)
                }
            ],
            is_available: true,
        };
        productVariant2 = await createMockProductVariant(productUseCases, productVariantData2);


        const mockPriorityMap: Record<Supplier['name'], IVendorSaleMapItem> = {
            [vendor.name]: {
                [attrBrandValue]: 0.2,
                [attrBrandValue2]: 0.5,
            },
            [vendor2.name]: {
                [attrBrandValue]: 0.5,
                [attrBrandValue2]: 0.2,
            }
        };

        const mockOfferPriorityService = new OfferPriorityService(mockPriorityMap, CATALOG_PRIORITY_DEFAULT_VALUE);

        Offer.setOfferPriorityService(mockOfferPriorityService);

        offer = await createMockOffer({
            offerUseCases,
            productUseCases,
            productVariantID: productVariant.id,
            vendorID: vendor.id
        });

        offer2 = await createMockOffer({
            offerUseCases,
            productUseCases,
            productVariantID: productVariant.id,
            vendorID: vendor2.id
        });

        offer3 = await createMockOffer({
            offerUseCases,
            productUseCases,
            productVariantID: productVariant2.id,
            vendorID: vendor.id
        });

        offer4 = await createMockOffer({
            offerUseCases,
            productUseCases,
            productVariantID: productVariant2.id,
            vendorID: vendor2.id
        });

        Offer.setOfferPriorityService(offerPriorityService);
    });

    afterAll(async () => {
        await Offer.destroy({where: {id: {[Op.not]: 0}}});
        await AttrValue.destroy({where: {id: {[Op.not]: 0}}});
        await ProductVariant.destroy({where: {id: {[Op.not]: 0}}});
        await Product.destroy({where: {id: {[Op.not]: 0}}});
        await Attribute.destroy({where: {id: {[Op.not]: 0}}});
    });

    test('should get catalog item', async () => {
        const esProd = await catalogUseCases.get(productVariant.id);

        expect(esProd.offer.id).toBe(offer2.id);
    });


    // TODO unskip
    test.skip('should search with brand filter', async () => {
        const params: Elastic.SearchParams = {
            filters: [{key: 'attrs.brand.value', value: attrBrandValue2}]
        };

        await new Promise(resolve => {
            setTimeout(async () => {
                const searchResult = await catalogUseCases.search(params);

                console.log('searchResult', searchResult);

                expect(searchResult.total).toBe(1);
                resolve(void 0);
            }, 500);
        });
    });

})
