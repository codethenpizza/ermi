import Product from "@models/Product.model";

export abstract class Supplier {
    name: string
    abstract fetchData(): Promise<void>;
    abstract getDataCount(): Promise<number>;
    abstract getProductData(): Promise<Product[]>;
}


export const STOCK_MSK = 'Москва';
export const STOCK_SPB = 'Санкт-Петербург';
export const STOCK_TOLYATTI = 'Тольятти';
