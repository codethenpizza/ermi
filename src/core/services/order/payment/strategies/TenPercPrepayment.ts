import {PaymentStrat} from "@core/services/order/payment/strategies/PaymentStrat";
import {Transaction} from "sequelize";
import {IInvoiceCalc} from "@core/services/order/payment/types";

export class TenPercPrepayment implements PaymentStrat {
    async calculateInvoices(total: number, transaction?: Transaction): Promise<IInvoiceCalc[]> {

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
