import {createController} from "@core/Controller";
import {ProductElasticSearchAction} from "@actions/front/Product/ProductElasticSearchAction";
import {ProductElasticGetAction} from "@actions/front/Product/ProductElasticGetAction";

export const FrontProductController = createController([
    {method: 'post', path: '/search', action: ProductElasticSearchAction},
    {method: 'get', path: '/get/:id', action: ProductElasticGetAction},
]);
