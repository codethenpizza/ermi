import config from 'config';
import FTP from 'ftp';
import XmlStream from 'xml-stream';
import {Supplier, SupplierDisk} from "../supplier";
import Product from "@models/Product.model";
import {DiskMap} from "../ProductMapping";
import DiskoptimModel, {DiskoptimRawDiskMap} from "./Diskoptim.model"


export class Diskoptim implements Supplier, SupplierDisk {
    async fetchData(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('Start fetch Diskoptim');
            let counter = 0;
            try {
                const ftp = new FTP();
                ftp.connect(config.get('suppliers.Diskoptim.ftp'));

                ftp.get(config.get('suppliers.Diskoptim.ftp_file'), (err, stream) => {
                    const xml = new XmlStream(stream);
                    xml.on('endElement: Диск', async (item) => {
                        counter++;
                        const formattedItem = {};
                        for (const [key,value] of Object.entries(item)) {
                            if (DiskoptimRawDiskMap[key]) {
                                formattedItem[DiskoptimRawDiskMap[key]] = value
                            } else {
                                throw new Error(`undefined item key: ${key}`)
                            }
                        }
                        await DiskoptimModel.create(formattedItem);
                    });

                    xml.on('end', () => {
                        ftp.end();
                        console.log(`End fetch Slik [${counter}]`);
                        resolve();
                    });
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    async getProductData(): Promise<Product[]> {
        return undefined;
    }

    async getRims(): Promise<DiskMap[]> {
        return undefined;
    }

}



