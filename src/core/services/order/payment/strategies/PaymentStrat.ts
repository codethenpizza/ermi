import {Transaction} from "sequelize";
import {IInvoiceCalc} from "@core/services/order/payment/types";

export abstract class PaymentStrat {
    abstract calculateInvoices(total: number, transaction?: Transaction): Promise<IInvoiceCalc[]>;
}
