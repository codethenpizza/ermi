import {IInvoiceCreate} from "@core/models/Invoice.model";

export interface IInvoiceCalc extends Omit<IInvoiceCreate, 'order_id'> {
}
