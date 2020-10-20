import {ProductMapping} from "./ProductMapping";
//suppliers
import {Supplier} from "./supplier";
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
    await mapping.storeDisk([
        // new Discovery()
    ]);
};
