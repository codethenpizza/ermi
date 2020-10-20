import {SupplierDisk} from "./types";
import {Discovery} from "./Discovery/Discovery";
import {ProductMapping} from "./ProductMapping";
import {Slik} from "./Slik/Slik"

const suppliers: SupplierDisk[] = [
    new Discovery(),
    new Slik()
];

export const fetchAll = async () => {
    for (const supp of suppliers) {
        await supp.fetchData();
    }
};

export const storeAll = async () => {
    const mapping = new ProductMapping();
    await mapping.storeDisk(suppliers);
};
