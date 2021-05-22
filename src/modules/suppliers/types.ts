import Product from "@models/Product.model";

export abstract class Supplier {
    name: string
    abstract fetchData(): Promise<void>;
    abstract getDataCount(): Promise<number>;
    abstract getProductData(): Promise<Product[]>;
}

export abstract class SupplierDisk extends Supplier {
    abstract getRims(limit: number, offset: number): Promise<DiskMap[]>;
}

export interface DiskMap {
    supplier: string;
    model: string; // ДИСК
    brand: string;
    uid: string;
    color: string;
    width: number; //ШИРИНА ДИСКА
    et: number;  //ВЫЛЕТ
    diameter: number; //ДИАМЕТР ДИСКА
    bolts_count: number; //КОЛ-ВО ОТВЕРСТИЙ
    bolts_spacing: number; // ДИАМЕТР ОКРУЖНОСТИ
    pcd: string; //ДИАМЕТР ОКРУЖНОСТИ X КОЛ-ВО ОТВЕРСТИЙ
    dia: number; // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
    image: string;
    price: number;
    inStock: number;
    type: string;
    stock: string;
}

export interface DiskStock {
    name: string;
    shippingTime: string;
    count: number;
}

export interface DiskMapOptions {
    model: number;
    brand: number;
    color: number;
    width: number; //ШИРИНА ДИСКА
    et: number;  //ВЫЛЕТ
    diameter: number; //ДИАМЕТР ДИСКА
    bolts_count: number; //КОЛ-ВО ОТВЕРСТИЙ
    bolts_spacing: number; // ДИАМЕТР ОКРУЖНОСТИ
    pcd: number; //ДИАМЕТР ОКРУЖНОСТИ X КОЛ-ВО ОТВЕРСТИЙ
    dia: number; // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
    type: number;
    attr_set_id: number;
    supplier: number;
    stock: number;
    cat: number;
}

export const DISK_MODEL = 'Model';
export const DISK_BRAND = 'Brand';
export const DISK_COLOR = 'Color';
export const DISK_WIDTH = 'Width';
export const DISK_ET = 'ET';
export const DISK_DIAMETER = 'Diameter';
export const DISK_BOLTS_COUNT = 'Bolts count';
export const DISK_BOLTS_SPACING = 'Bolts spacing';
export const DISK_PCD = 'PCD';
export const DISK_DIA = 'DIA';
export const DISK_TYPE = 'Type';
export const DISK_SUPPLIER = 'Supplier';
export const DISK_SUPPLIER_STOCK = 'Stock';

export const STOCK_MSK = 'Москва';
export const STOCK_SPB = 'Санкт-Петербург';
export const STOCK_TOLYATTI = 'Тольятти';
