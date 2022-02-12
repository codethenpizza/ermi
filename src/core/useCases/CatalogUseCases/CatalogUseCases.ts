import {ElasticProductService} from "@core/services/elastic/ElasticProductService/ElasticProductService";
import {B2BDiscountService} from "@core/services/b2b/B2BDiscountService";
import {IUser} from "@core/models/User.model";
import Attribute from "@core/models/Attribute.model";
import {OfferPriorityService} from "@core/services/catalog/OfferPriorityService";
import {Elastic} from "@core/services/elastic/types";
import {CatalogEsQueryBuilderService} from "@core/services/elastic/CatalogEsQueryBuilderService/CatalogEsQueryBuilderService";
import {CatalogSearchResponse} from "@core/useCases/CatalogUseCases/types";
import {getAttrFilterOptionsMap} from "@core/useCases/CatalogUseCases/helpers";

export class CatalogUseCases {

    constructor(
        private elasticProductService: ElasticProductService,
        private b2bDiscountService: B2BDiscountService,
        private offerPriorityService: OfferPriorityService,
        private catalogEsQueryBuilderService: CatalogEsQueryBuilderService
    ) {
    }

    async get(id: number | string, user?: Partial<IUser>): Promise<Elastic.ProductVariantFormatted | null> {
        const product = await this.elasticProductService.getByID(id);
        if (product) {
            let productWithOffer = await this.offerPriorityService.chooseOffer(product);

            if (user?.b2b_discount_group_id) {
                productWithOffer = await this.b2bDiscountService.enrichESProductByB2BUserDiscount(user, productWithOffer) as Elastic.ProductVariantFormatted;
            }

            return productWithOffer;
        } else {
            return null;
        }
    }

    async search(params: Elastic.SearchParams, user?: Partial<IUser>): Promise<CatalogSearchResponse> {
        const aggAttrs = await Attribute.findAggregatable();

        const availableFilters: Elastic.SearchFilter[] = [
            {key: 'is_available', value: true},
            {key: 'offers.is_available', value: true},
            {key: 'offers.priority', value: true},
        ];

        params.filters = params.filters?.length ? [...params.filters, ...availableFilters] : availableFilters;

        const query = this.catalogEsQueryBuilderService.makeQuery({
            filters: params.filters,
            groupedFilters: params.extFilters?.data,
            searchString: params.searchString,
        }, aggAttrs).build();

        console.log('query', JSON.stringify(query, null, 2));

        const {products, total, aggregations} = await this.elasticProductService.search({
            body: query,
            size: params.size,
            from: params.from,
            sort: params.sort || 'name'
        });

        let productOffers: Elastic.ProductVariantFormatted[] = await Promise.all(products.map(x => this.offerPriorityService.chooseOffer(x)));

        if (user?.b2b_discount_group_id) {
            productOffers = await this.b2bDiscountService.enrichESProductByB2BUserDiscount(user, productOffers) as Elastic.ProductVariantFormatted[];
        }

        const attrFilterOptions = getAttrFilterOptionsMap(aggregations, aggAttrs);

        return {
            products: productOffers,
            total,
            attrFilterOptionsMap: attrFilterOptions
        };
    }

}
