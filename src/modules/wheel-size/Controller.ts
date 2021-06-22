import {createController} from "@core/Controller";
import {MakeListAction} from "./actions/MakeListAction";
import {YearListAction} from "./actions/YearListAction";
import {ModelListAction} from "./actions/ModelListAction";
import {WheelsSearchAction} from "./actions/WheelsSearchAction";
import {GenerationListAction} from "./actions/GenerationListAction";
import {ModificationsListAction} from "./actions/ModificationsListAction";
import {DiameterListAction} from "./actions/DiameterListAction";

export const WheelSizeController = createController([
    {method: 'get',  path: '/makes', action: MakeListAction},
    {method: 'post', path: '/years', action: YearListAction},
    {method: 'post', path: '/models', action: ModelListAction},
    {method: 'post', path: '/generations', action: GenerationListAction},
    {method: 'post', path: '/trims', action: ModificationsListAction},
    {method: 'post', path: '/diameters', action: DiameterListAction},
    {method: 'post', path: '/search', action: WheelsSearchAction},
]);
