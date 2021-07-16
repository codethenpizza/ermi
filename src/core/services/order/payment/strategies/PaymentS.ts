import {IInvoice} from "@models/Invoice.model";

export abstract class PaymentS {
    abstract calculateInvoices(total: number): Promise<IInvoice[]>;
}
