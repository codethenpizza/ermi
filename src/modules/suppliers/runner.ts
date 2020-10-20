import {SupplierDisk} from "./types";
import {ProductMapping} from "./ProductMapping";
//suppliers
import {Discovery} from "./Discovery/Discovery";
import {Slik} from "./Slik/Slik"
import {Diskoptim} from "./Diskoptim/Diskoptim"

const suppliers: Supplier[] = [
    // new Slik(),
    new Diskoptim(),
    // new Discovery(),
];

export const fetchAll = async () => {
    for (const supp of suppliers) {
        await supp.fetchData();
    }
};

export const storeAll = async () => {
    const mapping = new ProductMapping();
    // await mapping.storeDisk(suppliers);
    await mapping.storeDisk([
        // new Discovery()
    ]);
};
