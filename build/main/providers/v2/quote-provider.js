"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.V2QuoteProvider = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const sdk_core_1 = require("@uniswap/sdk-core");
const v2_sdk_1 = require("@uniswap/v2-sdk");
const log_1 = require("../../util/log");
const routes_1 = require("../../util/routes");
/**
 * Computes quotes for V2 off-chain. Quotes are computed using the balances
 * of the pools within each route provided.
 *
 * @export
 * @class V2QuoteProvider
 */
class V2QuoteProvider {
    constructor() { }
    async getQuotesManyExactIn(amountIns, routes) {
        return this.getQuotes(amountIns, routes, sdk_core_1.TradeType.EXACT_INPUT);
    }
    async getQuotesManyExactOut(amountOuts, routes) {
        return this.getQuotes(amountOuts, routes, sdk_core_1.TradeType.EXACT_OUTPUT);
    }
    async getQuotes(amounts, routes, tradeType) {
        const routesWithQuotes = [];
        const debugStrs = [];
        for (const route of routes) {
            const amountQuotes = [];
            let insufficientInputAmountErrorCount = 0;
            let insufficientReservesErrorCount = 0;
            for (const amount of amounts) {
                try {
                    if (tradeType == sdk_core_1.TradeType.EXACT_INPUT) {
                        let outputAmount = amount.wrapped;
                        for (const pair of route.pairs) {
                            // @ts-ignore
                            const [outputAmountNew] = pair.getOutputAmount(outputAmount);
                            // @ts-ignore
                            outputAmount = outputAmountNew;
                        }
                        amountQuotes.push({
                            amount,
                            quote: bignumber_1.BigNumber.from(outputAmount.quotient.toString()),
                        });
                    }
                    else {
                        let inputAmount = amount.wrapped;
                        for (let i = route.pairs.length - 1; i >= 0; i--) {
                            const pair = route.pairs[i];
                            // @ts-ignore
                            [inputAmount] = pair.getInputAmount(inputAmount);
                        }
                        amountQuotes.push({
                            amount,
                            quote: bignumber_1.BigNumber.from(inputAmount.quotient.toString()),
                        });
                    }
                }
                catch (err) {
                    // Can fail to get quotes, e.g. throws InsufficientReservesError or InsufficientInputAmountError.
                    if (err instanceof v2_sdk_1.InsufficientInputAmountError) {
                        insufficientInputAmountErrorCount =
                            insufficientInputAmountErrorCount + 1;
                        amountQuotes.push({ amount, quote: null });
                    }
                    else if (err instanceof v2_sdk_1.InsufficientReservesError) {
                        insufficientReservesErrorCount = insufficientReservesErrorCount + 1;
                        amountQuotes.push({ amount, quote: null });
                    }
                    else {
                        throw err;
                    }
                }
            }
            if (insufficientInputAmountErrorCount > 0 ||
                insufficientReservesErrorCount > 0) {
                debugStrs.push(`${[
                    routes_1.routeToString(route),
                ]} Input: ${insufficientInputAmountErrorCount} Reserves: ${insufficientReservesErrorCount} }`);
            }
            routesWithQuotes.push([route, amountQuotes]);
        }
        if (debugStrs.length > 0) {
            log_1.log.info({ debugStrs }, `Failed quotes for V2 routes`);
        }
        return {
            routesWithQuotes,
        };
    }
}
exports.V2QuoteProvider = V2QuoteProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVvdGUtcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3YyL3F1b3RlLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUFxRDtBQUNyRCxnREFBOEM7QUFDOUMsNENBR3lCO0FBR3pCLHdDQUFxQztBQUNyQyw4Q0FBa0Q7QUFzQmxEOzs7Ozs7R0FNRztBQUNILE1BQWEsZUFBZTtJQUMxQixnQkFBZSxDQUFDO0lBRVQsS0FBSyxDQUFDLG9CQUFvQixDQUMvQixTQUEyQixFQUMzQixNQUFpQjtRQUVqQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxvQkFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFTSxLQUFLLENBQUMscUJBQXFCLENBQ2hDLFVBQTRCLEVBQzVCLE1BQWlCO1FBRWpCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFLG9CQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVPLEtBQUssQ0FBQyxTQUFTLENBQ3JCLE9BQXlCLEVBQ3pCLE1BQWlCLEVBQ2pCLFNBQW9CO1FBRXBCLE1BQU0sZ0JBQWdCLEdBQXdCLEVBQUUsQ0FBQztRQUVqRCxNQUFNLFNBQVMsR0FBYSxFQUFFLENBQUM7UUFDL0IsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDMUIsTUFBTSxZQUFZLEdBQW9CLEVBQUUsQ0FBQztZQUV6QyxJQUFJLGlDQUFpQyxHQUFHLENBQUMsQ0FBQztZQUMxQyxJQUFJLDhCQUE4QixHQUFHLENBQUMsQ0FBQztZQUN2QyxLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRTtnQkFDNUIsSUFBSTtvQkFDRixJQUFJLFNBQVMsSUFBSSxvQkFBUyxDQUFDLFdBQVcsRUFBRTt3QkFDdEMsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFD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