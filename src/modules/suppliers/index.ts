import "@core/database";
import {Supplier} from "./interfaces/Supplier";
import {SupplierDataParser} from "./SupplierDataParser";
import {offerUseCases, productUseCases} from "@core/useCases";
import {IProductMapper} from "./interfaces/ProductMapper";
import {rimOptions} from "./productTypes/rim/rimOptions";
import {suppliersConfig} from "config";
import {Slik} from "./models/Slik/Slik";
import {Diskoptim} from "./models/Diskoptim/Diskoptim";
import {Discovery} from "./models/Discovery/Discovery";
import {Kolrad} from "./models/Kolrad/Kolrad";
import {Shinservice} from "./models/Shinservice/Shinservice";
import {tireOptions} from "./productTypes/tire/tireOptions";

const suppliers: Supplier[] = [
    new Discovery(),
    new Slik(),
    new Diskoptim(),
    new Kolrad(),
    new Shinservice()
];

const productTypeOptionsArr: IProductMapper.ProductTypeOptions[] = [
    rimOptions,
    tireOptions
    // {method: 'getTires', map: 'dsa'} as IProductMapper.MapItem<TireData>,
];

const supplierDataParser = new SupplierDataParser(suppliersConfig, productUseCases, offerUseCases);


export const loadSuppliersData = async () => {
    for (const supp of suppliers) {
        try {
            await supp.loadData();
        } catch (e) {
            console.error(e);
        }
    }
};

export const parseSuppliersData = async () => {
    await supplierDataParser.parseData(suppliers, productTypeOptionsArr);
};

export const updateSuppliersData = async () => {
    console.log(new Date());
    await loadSuppliersData();
    await parseSuppliersData();
    console.log(new Date());
};
