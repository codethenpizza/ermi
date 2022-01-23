import {PaymentStrat} from "@core/services/order/payment/strategies/PaymentStrat";
import PaymentStrategy from "@core/models/PaymentStrategy.model";
import {customStringify} from "@core/helpers/utils";
import {Transaction} from "sequelize";
import {IInvoiceCalc} from "@core/services/order/payment/types";

export class PaymentService {

    constructor(
        private readonly strategies: { [x: string]: PaymentStrat }
    ) {
    }

    async makeInvoices(total: number, paymentStrategyId: number, transaction?: Transaction): Promise<IInvoiceCalc[]> {
        if (!total || !paymentStrategyId) {
            throw new Error('makeInvoices error: ' + total + paymentStrategyId,);
        }

        const strategy = await PaymentStrategy.findByPk(paymentStrategyId, {transaction});

        return this.strategies[customStringify(strategy.strategy)].calculateInvoices(total, transaction);
    }
}
