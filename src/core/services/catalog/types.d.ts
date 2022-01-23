export interface IVendorSaleMap {
    [vendorID: number]: IVendorSaleMapItem;
}

export interface IVendorSaleMapItem {
    [brandName: string]: number;
}
