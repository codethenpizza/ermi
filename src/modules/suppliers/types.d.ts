import Product from "@models/Product.model";
import {DiskMap} from "./ProductMapping";

export abstract class Supplier {
    abstract fetchData(): Promise<void>;
    abstract getProductData(): Promise<Product[]>;
}

export abstract class SupplierDisk extends Supplier {
    abstract getRims(): Promise<DiskMap[]>;
}
