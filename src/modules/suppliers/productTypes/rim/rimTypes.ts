import {OptionsIDMapping, ParsedData} from "../../types";

export abstract class SupplierRim {
    abstract getRims(limit: number, offset: number): Promise<ParsedData<RimMap>[]>;
}

export interface RimMap {
    model: string; // ДИСК
    brand: string;
    color: string;
    width: number; //ШИРИНА ДИСКА
    et: number;  //ВЫЛЕТ
    diameter: number; //ДИАМЕТР ДИСКА
    bolts_count: number; //КОЛ-ВО ОТВЕРСТИЙ
    bolts_spacing: number; // ДИАМЕТР ОКРУЖНОСТИ
    pcd: string; //ДИАМЕТР ОКРУЖНОСТИ X КОЛ-ВО ОТВЕРСТИЙ
    dia: number; // ЦЕНТРАЛЬНОЕ ОТВЕРСТИЕ*
    type: string;
    beadlock?: boolean;
    countryOfOrigin?: string;
}

export interface Stock {
    name: string;
    shippingTime: {
        from: number;
        to: number;
    };
    count: number;
}

export interface RimMapOptions extends OptionsIDMapping {
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
    beadlock: number; // Бедлок (загугли)
    countryOfOrigin: number;
}

export const RIM_MODEL = 'Model';
export const RIM_COLOR = 'Color';
export const RIM_WIDTH = 'Width';
export const RIM_ET = 'ET';
export const RIM_DIAMETER = 'Diameter';
export const RIM_BOLTS_COUNT = 'Bolts count';
export const RIM_BOLTS_SPACING = 'Bolts spacing';
export const RIM_PCD = 'PCD';
export const RIM_DIA = 'DIA';
export const RIM_TYPE = 'Type';
export const RIM_BEADLOCK = 'Beadlock';
export const RIM_COUNTRY_OF_ORIGIN = 'Country of Origin';
