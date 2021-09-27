import {fetchAll, storeAll} from './runner'
import "@db";

export const parseSuppliers = async () => {
    console.log(new Date());
    await fetchAll();
    await storeAll();
    console.log(new Date());
};
