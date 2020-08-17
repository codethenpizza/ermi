import {Supplier} from "../supplier";
import {Discovery} from "./Discovery/Discovery";
import Product from "@models/Product.model";

const suppliers: Supplier[] = [
    new Discovery()
];

export const fetchAll = async () => {
    for (const supp of suppliers) {
        await supp.fetchData();
    }
};

export const storeAll = async () => {
    for (const supp of suppliers) {
        const products: Product[] = await supp.getProductData();
        // TODO updateOrCreate
    }
};

