import {
    authService,
    b2bDiscountService,
    catalogEsQueryBuilderService,
    discountService,
    elasticProductService,
    imageService,
    notificationService,
    offerPriorityService,
    offerRelationFindService,
    paymentService,
    shippingService
} from "@core/services";

import {CatalogUseCases} from "@core/useCases/CatalogUseCases/CatalogUseCases";
import {OfferUseCases} from "@core/useCases/OfferUseCases/OfferUseCases";
import {ProductUseCases} from "@core/useCases/ProductUseCases/ProductUseCases";
import {ImageUseCases} from "@core/useCases/ImageUseCases";
import {OrderUseCases} from "@core/useCases/OrderUseCases/OrderUseCases";
import {UserUseCases} from "@core/useCases/UserUseCases/UserUseCases";

const catalogUseCases = new CatalogUseCases(elasticProductService, b2bDiscountService, offerPriorityService, catalogEsQueryBuilderService);

const productUseCases = new ProductUseCases();

const imageUseCases = new ImageUseCases(imageService);

const offerUseCases = new OfferUseCases(offerRelationFindService, imageUseCases, productUseCases);

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

const userUseCases = new UserUseCases(authService);

export {
    catalogUseCases,
    offerUseCases,
    productUseCases,
    imageUseCases,
    orderUseCases,
    userUseCases
}
