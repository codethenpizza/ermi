import {PaymentS} from "@core/services/order/payment/strategies/PaymentS";
import slugify from "slugify";
import {FullPrepayment} from "@core/services/order/payment/strategies/FullPrepayment";
import {TenPercPrepayment} from "@core/services/order/payment/strategies/TenPercPrepayment";
import PaymentStrategy from "@models/PaymentStrategy.model";
import {IInvoice} from "@models/Invoice.model";

const s = (className: string) => slugify(className, {lower: true});

export class PaymentService {
    private readonly strategies: {[x: string]: PaymentS} = {
        [s(FullPrepayment.name)]: new FullPrepayment(),
        [s(TenPercPrepayment.name)]: new TenPercPrepayment()
    };

    async makeInvoices(total: number, paymentStrategyId: number): Promise<IInvoice[]> {
        if (!total || !paymentStrategyId) {
            throw new Error('makeInvoices error: ' + total + paymentStrategyId,);
        }

        const strategy = await PaymentStrategy.findByPk(paymentStrategyId);

        return this.strategies[s(strategy.strategy)].calculateInvoices(total);
    }
}
