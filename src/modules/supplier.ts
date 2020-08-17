import Product from "@models/Product.model";

export abstract class Supplier {
    abstract async fetchData(): Promise<void>;
    abstract async getProductData(): Promise<Product[]>;
}
