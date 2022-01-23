import Vendor, {IVendor, IVendorCreate} from "@core/models/Vendor.model";

export abstract class Supplier {
    readonly name: string

    protected vendor: IVendor;

    abstract loadData(): Promise<void>;

    abstract getDataCount(): Promise<number>;

    async getVendorId(): Promise<number> {
        if (!this.vendor) {
            const vendorData: IVendorCreate = {name: this.name};
            this.vendor = await Vendor.findOne({where: vendorData});
            if (!this.vendor) {
                this.vendor = await Vendor.create(vendorData);
            }
        }

        return this.vendor.id;
    }
}
