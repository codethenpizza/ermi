import Product from "@models/Product.model";

export abstract class Supplier {
    abstract fetchData(): Promise<void>;
    abstract getProductData(): Promise<Product[]>;
}

export abstract class SupplierDisk extends Supplier {
    abstract getRims(): Promise<DiskMap[]>;
}

export interface DiskMap {
    model_name: string; // ДИСК
    brand: string;
    uid: string;
    color: string;
    width: number; //ШИРИНА ДИСКА
    et: number;  //ВЫЛЕТ
    diameter: number; //ДИАМЕТР ДИСКА
    bolts_count: number; //КОЛ-ВО ОТВЕРСТИЙ
    bolts_spacing: number;
    pcd: number; //ДИАМЕТР ОКРУЖНОСТИ* bolts_spacing
    pcd2?: number; //ДИАМЕТР ОКРУЖНОСТИ 2 bolts_spacing 2
    dia: number; // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
    image: string;
    price: number;
    priceMRC: number;
    inStock: number;
    type: string;

    // countUSN?: number;
    // count_rst?: number;
    // count_chl?: number;
    // count_nsb?: number;
    //
    // //непонятная хуйня
    // USN: boolean;
    // cap: string;
    // capR: string;
    // auto: string;
    // fix: string;
    // fixcode: string;
}

export interface DiskMapOptions {
    brand: number;
    color: number;
    width: number; //ШИРИНА ДИСКА
    et: number;  //ВЫЛЕТ
    diameter: number; //ДИАМЕТР ДИСКА
    bolts_count: number; //КОЛ-ВО ОТВЕРСТИЙ
    bolts_spacing: number;
    pcd: number; //ДИАМЕТР ОКРУЖНОСТИ* bolts_spacing
    pcd2?: number; //ДИАМЕТР ОКРУЖНОСТИ 2 bolts_spacing 2
    dia: number; // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
    priceMRC: number;
    type: number;
    attr_set_id: number;
}

export const DISK_BRAND = 'Brand';
export const DISK_COLOR = 'Color';
export const DISK_WIDTH = 'Width';
export const DISK_ET = 'ET';
export const DISK_DIAMETER = 'Diameter';
export const DISK_BOLTS_COUNT = 'Bolts count';
export const DISK_BOLTS_SPACING = 'Bolts spacing';
export const DISK_PCD = 'PCD';
export const DISK_PCD2 = 'PCD2';
export const DISK_DIA = 'DIA';
export const DISK_RECOMMENDED_PRICE = 'Recommended price';
export const DISK_TYPE = 'Type';
