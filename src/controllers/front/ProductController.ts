import {createController} from "@core/Controller";
import {ProductElasticSearchAction} from "@actions/front/Product/ProductElasticSearchAction";
import {ProductElasticGetAction} from "@actions/front/Product/ProductElasticGetAction";
import {SearchByAxlesAction} from "../../modules/4wheels/actions/SearchByAxlesAction";

export const FrontProductController = createController([
    {method: 'post', path: '/search', action: ProductElasticSearchAction},
    {method: 'post', path: '/searchByAxles', action: SearchByAxlesAction},
    {method: 'get', path: '/get/:id', action: ProductElasticGetAction},
]);
