import {OptionsIDMapping, ParsedData} from "../../types";
// import {RimMap} from "../rim/rimTypes";


export abstract class SupplierTire {
    abstract getTires(limit: number, offset: number): Promise<ParsedData<TireMap>[]>;
}

export interface TireMap {
    model: string;  // model
    brand: string;  // brand
    width: number;  // ШИРИНА ШИНЫ
    profile: number;    // ВЫСОТА ПРОФИЛЯ
    diameter: string;   // ДИАМЕТР
    season: string;

}


export interface TireMapOptions extends OptionsIDMapping {
    model: number;  // model
    brand: number;  // brand
    width: number;  // ШИРИНА ШИНЫ
    profile: number;    // ВЫСОТА ПРОФИЛЯ
    diameter: number;   // ДИАМЕТР
    season: number;
}

export const TIRE_PREFIX = 'TIRE_';
export const TIRE_BRAND = TIRE_PREFIX + 'Brand';
export const TIRE_MODEL = TIRE_PREFIX + 'Model';
export const TIRE_WIDTH = TIRE_PREFIX + 'Width';
export const TIRE_PROFILE = TIRE_PREFIX + 'Profile';
export const TIRE_DIAMETER = TIRE_PREFIX + 'Diameter';
export const TIRE_SEASON = TIRE_PREFIX + 'Season';

