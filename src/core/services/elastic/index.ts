import {elastic} from 'config';
import {Client} from "@elastic/elasticsearch";
import {RimAttrScheme} from "../../../modules/suppliers/productTypes/rim/rimAttrScheme";
import {ElasticProductService} from "@core/services/elastic/ElasticProductService/ElasticProductService";
import {Normalizers} from "@core/services/elastic/schemas/normalizers";
import {EsScheme} from "@core/services/elastic/schemas/types";

export const getElasticProductService = (): ElasticProductService => {
    const node = `${elastic.protocol}://${elastic.host}${elastic.port ? ':' + elastic.port : ''}`
    const elasticClient = new Client({node});
    const ELASTIC_PRODUCT_INDEX = 'product';
    const ELASTIC_PRODUCT_SCHEMAS: EsScheme.Scheme[] = [
        // add product types attrs schemas here
        RimAttrScheme
    ];
    return new ElasticProductService(
        elasticClient,
        ELASTIC_PRODUCT_INDEX,
        ELASTIC_PRODUCT_SCHEMAS,
        Normalizers
    );
}
