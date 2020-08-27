import Product from "@models/Product.model";
import {DiskMap} from "./ProductMapping";

export abstract class Supplier {
    abstract async fetchData(): Promise<void>;
    abstract async getProductData(): Promise<Product[]>;
}

export abstract class SupplierDisk {
    abstract async getRims(): Promise<DiskMap[]>;
}
