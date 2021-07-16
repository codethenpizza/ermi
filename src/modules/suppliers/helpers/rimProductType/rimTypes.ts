import {Supplier} from "../../types";

export abstract class SupplierRim extends Supplier {
    abstract getRims(limit: number, offset: number): Promise<RimMap[]>;
}

export interface RimMap {
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

export interface RimStock {
    name: string;
    shippingTime: string;
    count: number;
}

export interface RimMapOptions {
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

export const RIM_MODEL = 'Model';
export const RIM_BRAND = 'Brand';
export const RIM_COLOR = 'Color';
export const RIM_WIDTH = 'Width';
export const RIM_ET = 'ET';
export const RIM_DIAMETER = 'Diameter';
export const RIM_BOLTS_COUNT = 'Bolts count';
export const RIM_BOLTS_SPACING = 'Bolts spacing';
export const RIM_PCD = 'PCD';
export const RIM_DIA = 'DIA';
export const RIM_TYPE = 'Type';
export const RIM_SUPPLIER = 'Supplier';
export const RIM_SUPPLIER_STOCK = 'Stock';
