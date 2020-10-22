import {createController} from "@core/Controller";
import {MakeListAction} from "./actions/MakeListAction";
import {YearListAction} from "./actions/YearListAction";
import {ModelListAction} from "./actions/ModelListAction";
import {WheelsSearchAction} from "./actions/WheelsSearchAction";

export const WheelSizeController = createController([
    {method: 'get', path: '/makes', action: MakeListAction},
    {method: 'post', path: '/years', action: YearListAction},
    {method: 'post', path: '/models', action: ModelListAction},
    {method: 'post', path: '/search', action: WheelsSearchAction},
]);
