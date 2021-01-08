import {ProductMapping} from "./ProductMapping";
import {SupplierDisk} from "./types"
//suppliers
import {Diskoptim} from "./Diskoptim/Diskoptim"
import {Slik} from "./Slik/Slik";
import {Discovery} from "./Discovery/Discovery";


const suppliers: SupplierDisk[] = [
    new Discovery(),
    new Slik(),
    new Diskoptim(),
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
    const mapping = new ProductMapping();
    await mapping.storeDisk(suppliers);
};
