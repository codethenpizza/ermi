import {createController} from "@core/Controller";
import {ProductElasticSearchAction} from "@actions/front/Product/ProductElasticSearchAction";

export const FrontProductController = createController([
    {method: 'post', path: '/search', action: ProductElasticSearchAction}
]);
