import {IOfferCreateData, IOfferCreateProductData, IOfferUpdateData} from "@core/useCases/OfferUseCases/types";
import Offer, {IOffer, IOfferCreate} from "@core/models/Offer.model";
import OfferImage, {IOfferImage} from "@core/models/OfferImage.model";
import {imageRelationsDiff} from "@core/helpers/relationsDiff";
import {ImageToEntity} from "@core/models/types";
import {Op, Transaction} from "sequelize";
import {OfferNotFound} from "@core/services/offer/errors";
import {OfferRelationFinderService} from "@core/services/offer/OfferRelationFinderService";
import {ImageUseCases} from "@core/useCases/ImageUseCases";
import {IOfferCreateOptions} from "@core/services/offer/types";
import {ProductUseCases} from "@core/useCases/ProductUseCases/ProductUseCases";
import {VendorOfferAlreadyExistsInVariant} from "@core/useCases/OfferUseCases/errors";

export class OfferUseCases {

    constructor(
        private relationFinderService: OfferRelationFinderService,
        private imageUseCases: ImageUseCases,
        private productUseCases: ProductUseCases
    ) {
    }

    async create(
        data: IOfferCreateData,
        productData: IOfferCreateProductData | number,
        options?: IOfferCreateOptions,
        transaction?: Transaction
    ): Promise<IOffer> {


        const productVariantID = typeof productData === "number" ?
            productData :
            await this.relationFinderService.getProductVariantID(
                productData as IOfferCreateProductData,
                this.productUseCases,
                options,
                transaction
            );

        const productVariantOffer = await Offer.findOne({
            where: {
                product_variant_id: productVariantID,
                vendor_id: data.vendor_id
            }, transaction
        });

        if (productVariantOffer) {
            throw new VendorOfferAlreadyExistsInVariant(data, productVariantOffer, transaction);
        }

        const offerImages: ImageToEntity[] = [];

        if (data.images) {
            offerImages.push(...data.images);
        }

        if (data.imageUrls?.length) {
            const imagesByUrl = await Promise.all(
                data.imageUrls.filter(x => Boolean(x)).map(async (url) => this.imageUseCases.createImageByUrl(url))
            );

            const imageToEntities = imagesByUrl.map((x) => ({image_id: x.id, position: 0}));

            offerImages.push(...imageToEntities);
        }

        const offer: IOfferCreate = {
            product_variant_id: productVariantID,
            price: data.price,
            discount_price: data.discount_price,
            vendor_id: data.vendor_id,
            vendor_code: data.vendor_code,
            is_available: data.is_available,
            in_stock_qty: data.in_stock_qty,
            stock: data.stock,
            offerImages
        };


        return Offer.create(offer, {include: Offer.getFullIncludes(), transaction})
            .then(x => x.toJSON() as IOffer);
    }

    async update(data: IOfferUpdateData, transaction?: Transaction): Promise<void> {
        const offer = data.id ?
            await Offer.findByPk(data.id, {transaction})
            : await this.findOfferModelByVendorData(data, transaction);

        if (!offer) {
            throw new OfferNotFound(data);
        }

        const {
            imageIdsToCreate,
            imageIdsToDestroy
        } = imageRelationsDiff<ImageToEntity, IOfferImage>(data.images, offer.offerImages || []);


        if (!offer.offerImages?.length && data.imageUrls?.length) {

            const imagesByUrl = await Promise.all(
                data.imageUrls.filter(x => Boolean(x)).map(async (url) => this.imageUseCases.createImageByUrl(url))
            );

            imageIdsToCreate.push(...imagesByUrl.map((x) => ({image_id: x.id, position: 0})));
        }


        if (imageIdsToDestroy.length) {
            await OfferImage.destroy({
                where: {
                    image_id: {[Op.in]: imageIdsToDestroy.map(x => x.id)},
                    offer_id: offer.id
                },
                transaction
            });
        }

        if (imageIdsToCreate.length) {
            const offerImageData: Omit<IOfferImage, 'id'>[] = imageIdsToCreate.map(x => ({
                ...x,
                offer_id: offer.id
            }));
            await OfferImage.bulkCreate(offerImageData, {transaction});
        }

        await offer.update(data, {transaction});
    }

    async updateOrCreate(
        data: IOfferCreateData,
        productData?: IOfferCreateProductData | number,
        productFindOptions?: IOfferCreateOptions,
        transaction?: Transaction
    ): Promise<void> {
        try {
            await this.update(data, transaction);
        } catch (e) {
            if (e instanceof OfferNotFound) {
                await this.create(data, productData, productFindOptions, transaction);
            } else {
                throw e;
            }
        }
    }

    private async findOfferModelByVendorData(data: Pick<IOfferUpdateData, 'vendor_id' | 'vendor_code'>, transaction?: Transaction): Promise<Offer | null> {
        return Offer.findOne({
            where: {vendor_id: data.vendor_id, vendor_code: data.vendor_code},
            include: Offer.getFullIncludes(),
            transaction
        });
    }

}
