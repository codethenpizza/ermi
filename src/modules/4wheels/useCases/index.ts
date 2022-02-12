import {FourWheelsCatalogUseCases} from "./FourWheelsCatalogUseCases/FourWheelsCatalogUseCases";
import {catalogEsQueryBuilderService, elasticProductService, offerPriorityService} from "@core/services";

const fourWheelsCatalogUseCases = new FourWheelsCatalogUseCases(catalogEsQueryBuilderService, elasticProductService, offerPriorityService);

export {
    fourWheelsCatalogUseCases
}
