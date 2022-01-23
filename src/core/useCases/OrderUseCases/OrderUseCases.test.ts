import {sequelizeTs} from "@core/database";
import {offerUseCases, productUseCases} from "@core/useCases";
import {ICreateOrderData, ICreateOrderDataProduct} from "@core/services/order/types";
import User, {IUser, IUserCreate} from "@core/models/User.model";
import Address, {IAddress} from "@core/models/Address.model";
import {createMockUser, generateMockUserData} from "../../../tests/helpers/createMockUser";
import {createMockAddress} from "../../../tests/helpers/createMockAddress";
import {ATTR_TYPE_ID, PAYMENT_STRATEGY_ID, PICKUP_POINT_ID, SHIPPING_TYPE_ID} from "../../../tests/constants";
import Offer, {IOffer} from "@core/models/Offer.model";
import {createMockOffer} from "../../../tests/helpers/createMockOffer";
import {createMockProductVariant} from "../../../tests/helpers/createMockProductVariant";
import ProductVariant from "@core/models/ProductVariant.model";
import Product from "@core/models/Product.model";
import {Courier} from "@core/services/order/shipping/strategies/Courier";
import {OrderUseCases} from "@core/useCases/OrderUseCases/OrderUseCases";
import {NotificationServiceMock} from "../../../tests/mockServices/NotificationServiceMock";
import {
    authService,
    b2bDiscountService,
    discountService,
    elasticProductService,
    offerPriorityService,
    paymentService,
    shippingService
} from "@core/services";
import {IProductVariantCreateData} from "@core/useCases/ProductUseCases/types";
import B2BDiscountGroup, {IB2BDiscountGroup} from "@core/models/B2BDiscountGroup.model";
import B2BDiscount, {IB2BDiscount} from "@core/models/B2BDiscount.model";
import Attribute, {IAttributeCreate} from "@core/models/Attribute.model";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import {Op} from "sequelize";

describe('Order use-cases', () => {

    const notificationService = new NotificationServiceMock();

    const orderUseCases = new OrderUseCases(
        notificationService,
        shippingService,
        discountService,
        b2bDiscountService,
        paymentService,
        elasticProductService,
        authService,
        offerPriorityService
    );

    let mockUser: IUser;
    let mockAddress: IAddress;
    let mockOffers: IOffer[];

    beforeAll(async () => {

        mockUser = await createMockUser(authService);
        mockAddress = await createMockAddress();

        const productVariant = await createMockProductVariant(productUseCases);
        mockOffers = await Promise.all([
            createMockOffer({
                offerUseCases,
                productUseCases,
                productVariantID: productVariant.id
            }),
            createMockOffer({
                offerUseCases,
                productUseCases,
                productVariantID: productVariant.id
            }),
        ]);
    });

    afterAll(async () => {
        await (await User.findByPk(mockUser.id)).destroy();
        await (await Address.findByPk(mockAddress.id)).destroy();

        const productVariant = await ProductVariant.findByPk(mockOffers[0].product_variant_id);

        const offersIDs = mockOffers.map(x => x.id);
        await Offer.destroy({where: {id: {[Op.in]: offersIDs}}});

        await (await Product.findByPk(productVariant.product_id)).destroy();
    });

    test('should create order: [new user, FullPrepayment, Courier, product items length = 1]', async () => {
        const transaction = await sequelizeTs.transaction();

        const offer = mockOffers[0];

        const productItem: ICreateOrderDataProduct = {qty: 4, offer_id: offer.id};

        const createOrderData: ICreateOrderData = {
            address: {
                address_id: mockAddress.id
            },
            payment_strategy_id: PAYMENT_STRATEGY_ID.FullPrepayment,
            userData: generateMockUserData(),
            productItems: [productItem],
            shipping_type_id: SHIPPING_TYPE_ID.Courier
        };

        const order = await orderUseCases.create(createOrderData, transaction);

        expect(order).not.toBeNull();

        // Check products and offers
        expect(order.esOrderProducts.length).toBe(createOrderData.productItems.length);
        expect(order.order.offers[0].qty).toBe(productItem.qty);
        expect(order.order.offers[0].offer_id).toBe(productItem.offer_id);


        expect(order.order.invoices.length).toBe(1); // PAYMENT_STRATEGY_ID.FullPrepayment
        expect(order.order.invoices[0].value).toBe(offer.price * productItem.qty + Courier.defaultCost); // SHIPPING_TYPE_ID.Courier


        await transaction.rollback();
    });

    test('should create order: [existed user, FullPrepayment, Courier, product items length = 1]', async () => {
        const transaction = await sequelizeTs.transaction();

        const offer = mockOffers[0];

        const productItem: ICreateOrderDataProduct = {qty: 4, offer_id: offer.id};

        const createOrderData: ICreateOrderData = {
            address: {
                address_id: mockAddress.id
            },
            payment_strategy_id: PAYMENT_STRATEGY_ID.FullPrepayment,
            user_id: mockUser.id,
            productItems: [productItem],
            shipping_type_id: SHIPPING_TYPE_ID.Courier
        };

        const order = await orderUseCases.create(createOrderData, transaction);

        expect(order).not.toBeNull();

        // Check products and offers
        expect(order.esOrderProducts.length).toBe(createOrderData.productItems.length);
        expect(order.order.offers[0].qty).toBe(productItem.qty);
        expect(order.order.offers[0].offer_id).toBe(productItem.offer_id);


        expect(order.order.invoices.length).toBe(1); // PAYMENT_STRATEGY_ID.FullPrepayment
        expect(order.order.invoices[0].value).toBe(offer.price * productItem.qty + Courier.defaultCost); // SHIPPING_TYPE_ID.Courier

        expect(order.order.user_id).toBe(mockUser.id);

        await transaction.rollback();
    });

    test('should create order: [existed user, TenPercPrepayment, Courier, product items length = 1]', async () => {
        const transaction = await sequelizeTs.transaction();

        const offer = mockOffers[0];

        const productItem: ICreateOrderDataProduct = {qty: 4, offer_id: offer.id};

        const createOrderData: ICreateOrderData = {
            address: {
                address_id: mockAddress.id
            },
            payment_strategy_id: PAYMENT_STRATEGY_ID.TenPercPrepayment,
            user_id: mockUser.id,
            productItems: [productItem],
            shipping_type_id: SHIPPING_TYPE_ID.Courier
        };

        const order = await orderUseCases.create(createOrderData, transaction);

        expect(order).not.toBeNull();

        // Check products and offers
        expect(order.esOrderProducts.length).toBe(createOrderData.productItems.length);
        expect(order.order.offers[0].qty).toBe(productItem.qty);
        expect(order.order.offers[0].offer_id).toBe(productItem.offer_id);


        expect(order.order.invoices.length).toBe(2); // PAYMENT_STRATEGY_ID.TenPercPrepayment

        const total = order.order.invoices.reduce((acc, x) => acc += x.value, 0);
        expect(total).toBe(offer.price * productItem.qty + Courier.defaultCost); // SHIPPING_TYPE_ID.Courier

        expect(order.order.user_id).toBe(mockUser.id);

        await transaction.rollback();
    });


    test('should create order: [existed user, TenPercPrepayment, Courier, product items length = 2]', async () => {
        const transaction = await sequelizeTs.transaction();

        const defaultQty = 4;

        const productItems: ICreateOrderDataProduct[] = mockOffers.map(x => ({qty: defaultQty, offer_id: x.id}));

        const createOrderData: ICreateOrderData = {
            address: {
                address_id: mockAddress.id
            },
            payment_strategy_id: PAYMENT_STRATEGY_ID.TenPercPrepayment,
            user_id: mockUser.id,
            productItems,
            shipping_type_id: SHIPPING_TYPE_ID.Courier
        };

        const order = await orderUseCases.create(createOrderData, transaction);

        expect(order).not.toBeNull();

        // Check products and offers
        expect(order.esOrderProducts.length).toBe(createOrderData.productItems.length);

        expect(order.order.invoices.length).toBe(2); // PAYMENT_STRATEGY_ID.TenPercPrepayment

        const total = order.order.invoices.reduce((acc, x) => acc += x.value, 0);
        const mockOffersSum = mockOffers.reduce((acc, x) => acc += x.price * defaultQty, 0);
        expect(total).toBe(mockOffersSum + Courier.defaultCost); // SHIPPING_TYPE_ID.Courier

        expect(order.order.user_id).toBe(mockUser.id);

        await transaction.rollback();
    });

    test('should create order: [existed user, FullPrepayment, LocalPickup, product items length = 1]', async () => {
        const transaction = await sequelizeTs.transaction();

        const offer = mockOffers[0];

        const productItem: ICreateOrderDataProduct = {qty: 4, offer_id: offer.id};

        const createOrderData: ICreateOrderData = {
            address: {
                address_id: mockAddress.id,
                pickup_point_id: PICKUP_POINT_ID.DEFAULT
            },
            payment_strategy_id: PAYMENT_STRATEGY_ID.FullPrepayment,
            user_id: mockUser.id,
            productItems: [productItem],
            shipping_type_id: SHIPPING_TYPE_ID.LocalPickup,
        };

        const order = await orderUseCases.create(createOrderData, transaction);

        expect(order).not.toBeNull();

        // Check products and offers
        expect(order.esOrderProducts.length).toBe(createOrderData.productItems.length);
        expect(order.order.offers[0].qty).toBe(productItem.qty);
        expect(order.order.offers[0].offer_id).toBe(productItem.offer_id);


        expect(order.order.invoices.length).toBe(1); // PAYMENT_STRATEGY_ID.FullPrepayment
        expect(order.order.invoices[0].value).toBe(offer.price * productItem.qty); // SHIPPING_TYPE_ID.LocalPickup

        expect(order.order.user_id).toBe(mockUser.id);

        expect(order.order.shipping[0].shippingType.id).toBe(SHIPPING_TYPE_ID.LocalPickup);
        expect(order.order.shipping[0].address_id).toBe(PICKUP_POINT_ID.DEFAULT);

        await transaction.rollback();
    });

    test('should create order: [b2b user, FullPrepayment, LocalPickup, product items length = 1]', async () => {
        const transaction = await sequelizeTs.transaction();

        const DISCOUNT_BRAND_NAME = 'testBrand';
        const DISCOUNT_VALUE = 0.5;

        const attrData: IAttributeCreate = {
            name: B2BDiscountService.focusedAttr,
            type_id: ATTR_TYPE_ID.STRING,
        };
        const attr = await Attribute.create(attrData, {transaction});

        const attrForFocus: IProductVariantCreateData["attrs"][0] = {
            attr_id: attr.id,
            value: DISCOUNT_BRAND_NAME
        };
        const productVariantData: IProductVariantCreateData = {
            images: [],
            attrs: [attrForFocus]
        };
        const mockProductVariant = await createMockProductVariant(productUseCases, productVariantData, transaction);

        const mockOffer = await createMockOffer({
            offerUseCases,
            productUseCases,
            productVariantID: mockProductVariant.id,
            transaction
        });

        const b2bDiscountData: IB2BDiscount = {pattern: {[DISCOUNT_BRAND_NAME]: {value: DISCOUNT_VALUE}}};
        const b2bDiscount = await B2BDiscount.create(b2bDiscountData, {transaction});

        const b2bDiscountGroupData: IB2BDiscountGroup = {name: 'test group', b2b_discount_id: b2bDiscount.id};
        const b2bDiscountGroup = await B2BDiscountGroup.create(b2bDiscountGroupData, {transaction});

        const userData: IUserCreate = {
            ...generateMockUserData(),
            b2b_discount_group_id: b2bDiscountGroup.id
        };
        const user = await createMockUser(authService, userData, transaction);


        const productItem: ICreateOrderDataProduct = {qty: 4, offer_id: mockOffer.id};

        const createOrderData: ICreateOrderData = {
            address: {
                address_id: mockAddress.id,
                pickup_point_id: PICKUP_POINT_ID.DEFAULT
            },
            payment_strategy_id: PAYMENT_STRATEGY_ID.FullPrepayment,
            user_id: user.id,
            productItems: [productItem],
            shipping_type_id: SHIPPING_TYPE_ID.LocalPickup,
        };

        const order = await orderUseCases.create(createOrderData, transaction);

        expect(order).not.toBeNull();

        const expectedTotal = mockOffer.price * DISCOUNT_VALUE * productItem.qty;

        expect(order.order.total).toBe(expectedTotal);

        const invoicesSum = order.order.invoices.reduce((acc, x) => acc += x.value, 0);
        expect(invoicesSum).toBe(expectedTotal);

        const esOrderProductsTotal = order.esOrderProducts.reduce((acc, x) => acc += x.offer.discount_price * productItem.qty, 0);
        expect(esOrderProductsTotal).toBe(expectedTotal);

        const orderOffersSum = order.order.offers.reduce((acc, x) => acc += x.price * x.qty, 0);
        expect(orderOffersSum).toBe(expectedTotal);

        await transaction.rollback();
    });

    test('should create order: [b2b user, FullPrepayment, LocalPickup, product items length = 2]', async () => {
        const transaction = await sequelizeTs.transaction();

        const DISCOUNT_BRAND_NAME = 'testBrand';
        const DISCOUNT_VALUE = 0.5;

        const attrData: IAttributeCreate = {
            name: B2BDiscountService.focusedAttr,
            type_id: ATTR_TYPE_ID.STRING,
        };
        const attr = await Attribute.create(attrData, {transaction});

        const attrForFocus: IProductVariantCreateData["attrs"][0] = {
            attr_id: attr.id,
            value: DISCOUNT_BRAND_NAME
        };
        const productVariantData: IProductVariantCreateData = {
            images: [],
            attrs: [attrForFocus]
        };
        const mockProductVariant = await createMockProductVariant(productUseCases, productVariantData, transaction);
        const mockProductVariant2 = await createMockProductVariant(productUseCases, productVariantData, transaction);

        const mockOffer = await createMockOffer({
            offerUseCases,
            productUseCases,
            productVariantID: mockProductVariant.id,
            transaction
        });
        const mockOffer2 = await createMockOffer({
            offerUseCases,
            productUseCases,
            productVariantID: mockProductVariant2.id,
            transaction
        });

        const b2bDiscountData: IB2BDiscount = {pattern: {[DISCOUNT_BRAND_NAME]: {value: DISCOUNT_VALUE}}};
        const b2bDiscount = await B2BDiscount.create(b2bDiscountData, {transaction});

        const b2bDiscountGroupData: IB2BDiscountGroup = {name: 'test group', b2b_discount_id: b2bDiscount.id};
        const b2bDiscountGroup = await B2BDiscountGroup.create(b2bDiscountGroupData, {transaction});

        const userData: IUserCreate = {
            ...generateMockUserData(),
            b2b_discount_group_id: b2bDiscountGroup.id
        };
        const user = await createMockUser(authService, userData, transaction);


        const QTY = 4;
        const productItems: ICreateOrderDataProduct[] = [
            {qty: QTY, offer_id: mockOffer.id},
            {qty: QTY, offer_id: mockOffer2.id}
        ];

        const createOrderData: ICreateOrderData = {
            address: {
                address_id: mockAddress.id,
                pickup_point_id: PICKUP_POINT_ID.DEFAULT
            },
            payment_strategy_id: PAYMENT_STRATEGY_ID.FullPrepayment,
            user_id: user.id,
            productItems,
            shipping_type_id: SHIPPING_TYPE_ID.LocalPickup,
        };

        const order = await orderUseCases.create(createOrderData, transaction);

        expect(order).not.toBeNull();

        const expectedTotal = (mockOffer.price * DISCOUNT_VALUE * QTY) + (mockOffer2.price * DISCOUNT_VALUE * QTY);

        expect(order.order.total).toBe(expectedTotal);

        const invoicesSum = order.order.invoices.reduce((acc, x) => acc += x.value, 0);
        expect(invoicesSum).toBe(expectedTotal);

        const esOrderProductsTotal = order.esOrderProducts.reduce((acc, x) => acc += x.offer.discount_price * QTY, 0);
        expect(esOrderProductsTotal).toBe(expectedTotal);

        const orderOffersSum = order.order.offers.reduce((acc, x) => acc += x.price * x.qty, 0);
        expect(orderOffersSum).toBe(expectedTotal);

        await transaction.rollback();
    });

});
