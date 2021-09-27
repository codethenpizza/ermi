import {ProductMapper} from "./ProductMapper";
//suppliers
import {Diskoptim} from "./models/Diskoptim/Diskoptim"
import {Slik} from "./models/Slik/Slik";
import {Discovery} from "./models/Discovery/Discovery";
import {Kolrad} from "./models/Kolrad/Kolrad";
import {SupplierRim} from "./helpers/rimProductType/rimTypes";

const suppliers: Array<SupplierRim> = [
    new Discovery(),
    new Slik(),
    new Diskoptim(),
    new Kolrad(),
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
