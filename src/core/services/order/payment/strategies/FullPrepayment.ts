import {PaymentS} from "@core/services/order/payment/strategies/PaymentS";
import {IInvoice} from "@models/Invoice.model";

export class FullPrepayment implements PaymentS {

    private readonly desc = 'Предоплата за заказ';

    async calculateInvoices(total: number): Promise<IInvoice[]> {
        return [{value: total, desc: this.desc}];
    }
}
