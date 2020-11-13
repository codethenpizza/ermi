// import {SupplierDisk} from "./types";
import {ProductMapping} from "./ProductMapping";
import {Supplier} from "./types"
//suppliers
import {Diskoptim} from "./Diskoptim/Diskoptim"
import {Slik} from "./Slik/Slik";


const suppliers: Supplier[] = [ //order should be saved for now
    // new Discovery(),
    new Slik(),
    // new Diskoptim(), //should be after SLik
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
    // await mapping.storeDisk(suppliers);
    await mapping.storeDisk([
        // new Discovery(),
        new Slik(),
        // new Diskoptim(),
    ]);
};
