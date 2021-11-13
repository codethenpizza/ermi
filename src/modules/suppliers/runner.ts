import {ProductMapper} from "./ProductMapper";
//suppliers
import {SupplierRim} from "./helpers/rimProductType/rimTypes";
import {Slik} from "./models/Slik/Slik";
import {Diskoptim} from "./models/Diskoptim/Diskoptim";
import {Discovery} from "./models/Discovery/Discovery";

const suppliers: Array<SupplierRim> = [
    new Discovery(),
    new Slik(),
    new Diskoptim(),
    // new Kolrad(),
];

export const fetchAll = async () => {
    for (const supp of suppliers) {
        try {
            await supp.fetchData();
        } catch (e) {
            console.error(e);
        }
    }
};

export const storeAll = async () => {
    const mapping = new ProductMapper();
    await mapping.mapProductData(suppliers);
};
