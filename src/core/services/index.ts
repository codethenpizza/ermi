import {images} from 'config';

import {AuthService} from "@core/services/auth/AuthService";
import {getCacheService} from "@core/services/cache/CacheService";
import {NotificationService} from "@core/services/notification/NotificationService";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import {getFilesService} from "@core/services/files/FilesService";
import {ImageService} from "@core/services/image/ImageService";
import {ShippingService} from "@core/services/order/shipping/ShippingService";
import {shippingStrategies} from "@core/services/order/shipping/strategies";
import {DiscountService} from "@core/services/order/discount/DiscountService";
import {discountStrategies} from "@core/services/order/discount/discounts";
import {PaymentService} from "@core/services/order/payment/PaymentService";
import {paymentStrategies} from "@core/services/order/payment/strategies";
import {OfferPriorityService} from "@core/services/catalog/OfferPriorityService";
import {getElasticProductService} from "@core/services/elastic";
import {OfferRelationFinderService} from "@core/services/offer/OfferRelationFinderService";
import {MailService} from "@core/services/notification/MailService";
import {SMSService} from "@core/services/notification/SMSService";
import {CatalogEsQueryBuilderService} from "@core/services/elastic/CatalogEsQueryBuilderService/CatalogEsQueryBuilderService";
import {CATALOG_PRIORITY_DEFAULT_VALUE, CATALOG_PRIORITY_MAP} from "@core/services/catalog/constants";

const elasticProductService = getElasticProductService();

const catalogEsQueryBuilderService = new CatalogEsQueryBuilderService(elasticProductService);

const authService = new AuthService();

const cacheService = getCacheService();

const mailService = new MailService();

const smsService = new SMSService()

const notificationService = new NotificationService(mailService, smsService);

const b2bDiscountService = new B2BDiscountService();

const filesService = getFilesService();

const imageService = new ImageService(filesService, images);

const shippingService = new ShippingService(shippingStrategies);

const discountService = new DiscountService(discountStrategies);

const paymentService = new PaymentService(paymentStrategies);

const offerPriorityService = new OfferPriorityService(CATALOG_PRIORITY_MAP, CATALOG_PRIORITY_DEFAULT_VALUE);

const offerRelationFindService = new OfferRelationFinderService();

export {
    elasticProductService,
    catalogEsQueryBuilderService,
    authService,
    cacheService,
    mailService,
    smsService,
    notificationService,
    b2bDiscountService,
    filesService,
    imageService,
    shippingService,
    discountService,
    paymentService,
    offerPriorityService,
    offerRelationFindService
}
