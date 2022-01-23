import {PaymentStrat} from "@core/services/order/payment/strategies/PaymentStrat";
import {FullPrepayment} from "@core/services/order/payment/strategies/FullPrepayment";
import {TenPercPrepayment} from "@core/services/order/payment/strategies/TenPercPrepayment";
import {customStringify} from "@core/helpers/utils";

export const paymentStrategies: { [x: string]: PaymentStrat } = {
    [customStringify(FullPrepayment.name)]: new FullPrepayment(),
    [customStringify(TenPercPrepayment.name)]: new TenPercPrepayment()
}
