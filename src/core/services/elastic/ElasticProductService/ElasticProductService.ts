import {ElasticIndexService} from "@core/services/elastic/ElasticIndexService";
import {IProductVariant} from "@core/models/ProductVariant.model";
import {ProductScheme} from "@core/services/elastic/schemas/ProductScheme";
import {mapProductVariantToEsProductVariant} from "@core/services/elastic/adapters/MapProductVariantToEsProductVariant";
import {Elastic} from "@core/services/elastic/types";
import {Search} from "@elastic/elasticsearch/api/requestParams";
import {TransportRequestOptions} from "@elastic/elasticsearch/lib/Transport";
import {EsRespProduct} from "@actions/front/types";
import {EsScheme} from "@core/services/elastic/schemas/types";

export class ElasticProductService extends ElasticIndexService {

    private mappingScheme: EsScheme.Scheme<Elastic.ProductVariant>;

    update(variant: IProductVariant) {
        const data = mapProductVariantToEsProductVariant(variant);
        return super.update(data);
    }

    // @ts-ignore
    getByID(id: string | number): Promise<Elastic.ProductVariant | null> {
        return super.getByID<Elastic.ProductVariant>(id);
    }

    // @ts-ignore
    search(params?: Search<any>, options?: TransportRequestOptions): Promise<Elastic.SearchResponse<Elastic.ProductVariant>> {
        return super.search<EsRespProduct>(params, options)
            .then(x => ({
                products: x.body.hits.hits.map(p => p._source),
                total: x.body.hits.total.value,
                aggregations: x.body.aggregations
            }));
    }

    async findByIds(ids: number[], byGet = false): Promise<Elastic.ProductVariant[]> {
        return super.findByIds(ids, byGet);
    }

    async setAvailability(id: number, isAvailable: boolean): Promise<void> {
        const body: Partial<Elastic.ProductVariant> = {is_available: isAvailable};
        await super.client.update({
            index: this.index,
            id: id.toString(),
            body
        });
    }

    getProductMapping(): EsScheme.Scheme<Elastic.ProductVariant> {
        if (this.mappingScheme) {
            return this.mappingScheme;
        }

        const scheme: EsScheme.Scheme<Omit<Elastic.ProductVariant, 'attrs'>> = {...ProductScheme};
        if (this.schemas.length) {
            scheme['attrs'] = {
                "properties": this.schemas.reduce((acc, s) => {
                    acc = {...acc, ...s};
                    return acc;
                }, {})
            }
        }

        this.mappingScheme = scheme as EsScheme.Scheme<Elastic.ProductVariant>;

        return this.mappingScheme;
    }

    protected createSettings(): Object {
        return {
            analysis: {
                normalizer: this.normalizers
            }
        };
    }

    protected getMapping(): EsScheme.Scheme {
        return this.getProductMapping();
    }

}
