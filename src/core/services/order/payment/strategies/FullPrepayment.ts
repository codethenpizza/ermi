import {PaymentStrat} from "@core/services/order/payment/strategies/PaymentStrat";
import {Transaction} from "sequelize";
import {IInvoiceCalc} from "@core/services/order/payment/types";

export class FullPrepayment implements PaymentStrat {

    private readonly desc = 'Предоплата за заказ';

    async calculateInvoices(total: number, transaction?: Transaction): Promise<IInvoiceCalc[]> {
        return [{value: total, desc: this.desc}];
    }
}
