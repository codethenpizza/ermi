import {Supplier} from "../../../modules/suppliers/interfaces/Supplier";
import {IVendorSaleMapItem} from "@core/services/catalog/types";
import {Discovery} from "../../../modules/suppliers/models/Discovery/Discovery";

// TODO remove hardcode

export enum BRAND_NAME {
    LS = 'LS',
    MIGLIA = '1000 MIGLIA',
    EnkeiRacing = 'Enkei Racing',
    INFORGED = 'INFORGED',
    ENKEI_TUNING = 'ENKEI TUNING',
    LS_FlowForming = 'LS FlowForming',
    VSN = 'VSN',
    REPLAY = 'REPLAY',
    MAK = 'MAK',
    Alutec = 'Alutec',
    FR_Replica = 'FR Replica'
}

export const CATALOG_PRIORITY_MAP: Record<Supplier['name'], IVendorSaleMapItem> = {
    [Discovery.name]: {
        [BRAND_NAME.LS]: 0.1,
        [BRAND_NAME.MIGLIA]: 0.13,
        [BRAND_NAME.EnkeiRacing]: 0.13,
        [BRAND_NAME.INFORGED]: 0.14,
        [BRAND_NAME.ENKEI_TUNING]: 0.13,
        [BRAND_NAME.LS_FlowForming]: 0.13,
        [BRAND_NAME.VSN]: 0.13,
        [BRAND_NAME.REPLAY]: 0.19,
    },
};

export const CATALOG_PRIORITY_DEFAULT_VALUE = 0.01;
