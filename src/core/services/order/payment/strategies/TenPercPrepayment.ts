import {PaymentS} from "@core/services/order/payment/strategies/PaymentS";
import {IInvoice} from "@models/Invoice.model";

export class TenPercPrepayment implements PaymentS {
    async calculateInvoices(total: number): Promise<IInvoice[]> {

        const firstVal = Math.floor((total / 100) * 10);
        const firstDesc = 'Предоплата 10% за заказ';

        const secondVal = total - firstVal;
        const secondDesc = 'Оплата 90% за заказ';

        return [
            {value: firstVal, desc: firstDesc},
            {value: secondVal, desc: secondDesc}
        ];
    }
}
