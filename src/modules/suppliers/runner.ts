import {ProductMapping} from "./ProductMapping";
import {ProductMapper} from "./ProductMapper";
//suppliers
import {Diskoptim} from "./Diskoptim/Diskoptim"
import {Slik} from "./Slik/Slik";
import {Discovery} from "./Discovery/Discovery";
import {Kolrad} from "./Kolrad/Kolrad";
import {SupplierRim} from "./helpers/rimProductType/rimTypes";

const suppliers: Array<SupplierRim> = [
    // new Discovery(),
    // new Slik(),
    // new Diskoptim(),
    new Kolrad(),
];

export const fetchAll = async () => {
    for (const supp of suppliers) {
        try {
            await supp.fetchData();
        }
        catch (e) {
            console.error(e);
        }
    }
};

export const storeAll = async () => {
    const mapping = new ProductMapper();
    await mapping.mapProductData(suppliers);
};
