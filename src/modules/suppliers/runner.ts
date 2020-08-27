import {Supplier} from "./supplier";
import {Discovery} from "./Discovery/Discovery";
import {ProductMapping} from "./ProductMapping";

const suppliers: Supplier[] = [
    new Discovery(),
    // new Slik()
];

export const fetchAll = async () => {
    for (const supp of suppliers) {
        await supp.fetchData();
    }
};

export const storeAll = async () => {
    const mapping = new ProductMapping();
    await mapping.storeDisk([
        new Discovery()
    ]);
};
