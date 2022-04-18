"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestSwapRouteBy = exports.getBestSwapRoute = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const router_sdk_1 = require("@uniswap/router-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const jsbi_1 = __importDefault(require("jsbi"));
const lodash_1 = __importDefault(require("lodash"));
const fixed_reverse_heap_1 = __importDefault(require("mnemonist/fixed-reverse-heap"));
const queue_1 = __importDefault(require("mnemonist/queue"));
const util_1 = require("../../../util");
const amounts_1 = require("../../../util/amounts");
const log_1 = require("../../../util/log");
const metric_1 = require("../../../util/metric");
const routes_1 = require("../../../util/routes");
const gas_models_1 = require("../gas-models");
async function getBestSwapRoute(amount, percents, routesWithValidQuotes, routeType, chainId, routingConfig, gasModel) {
    const now = Date.now();
    // Build a map of percentage of the input to list of valid quotes.
    // Quotes can be null for a variety of reasons (not enough liquidity etc), so we drop them here too.
    const percentToQuotes = {};
    for (const routeWithValidQuote of routesWithValidQuotes) {
        if (!percentToQuotes[routeWithValidQuote.percent]) {
            percentToQuotes[routeWithValidQuote.percent] = [];
        }
        percentToQuotes[routeWithValidQuote.percent].push(routeWithValidQuote);
    }
    metric_1.metric.putMetric('BuildRouteWithValidQuoteObjects', Date.now() - now, metric_1.MetricLoggerUnit.Milliseconds);
    // Given all the valid quotes for each percentage find the optimal route.
    const swapRoute = await getBestSwapRouteBy(routeType, percentToQuotes, percents, chainId, (rq) => rq.quoteAdjustedForGas, routingConfig, gasModel);
    // It is possible we were unable to find any valid route given the quotes.
    if (!swapRoute) {
        return null;
    }
    // Due to potential loss of precision when taking percentages of the input it is possible that the sum of the amounts of each
    // route of our optimal quote may not add up exactly to exactIn or exactOut.
    //
    // We check this here, and if there is a mismatch
    // add the missing amount to a random route. The missing amount size should be neglible so the quote should still be highly accurate.
    const { routes: routeAmounts } = swapRoute;
    const totalAmount = lodash_1.default.reduce(routeAmounts, (total, routeAmount) => total.add(routeAmount.amount), amounts_1.CurrencyAmount.fromRawAmount(routeAmounts[0].amount.currency, 0));
    const missingAmount = amount.subtract(totalAmount);
    if (missingAmount.greaterThan(0)) {
        log_1.log.info({
            missingAmount: missingAmount.quotient.toString(),
        }, `Optimal route's amounts did not equal exactIn/exactOut total. Adding missing amount to last route in array.`);
        routeAmounts[routeAmounts.length - 1].amount =
            routeAmounts[routeAmounts.length - 1].amount.add(missingAmount);
    }
    log_1.log.info({
        routes: (0, routes_1.routeAmountsToString)(routeAmounts),
        numSplits: routeAmounts.length,
        amount: amount.toExact(),
        quote: swapRoute.quote.toExact(),
        quoteGasAdjusted: swapRoute.quoteGasAdjusted.toFixed(Math.min(swapRoute.quoteGasAdjusted.currency.decimals, 2)),
        estimatedGasUSD: swapRoute.estimatedGasUsedUSD.toFixed(Math.min(swapRoute.estimatedGasUsedUSD.currency.decimals, 2)),
        estimatedGasToken: swapRoute.estimatedGasUsedQuoteToken.toFixed(Math.min(swapRoute.estimatedGasUsedQuoteToken.currency.decimals, 2)),
    }, `Found best swap route. ${routeAmounts.length} split.`);
    return swapRoute;
}
exports.getBestSwapRoute = getBestSwapRoute;
async function getBestSwapRouteBy(routeType, percentToQuotes, percents, chainId, by, routingConfig, gasModel) {
    var _a;
    // Build a map of percentage to sorted list of quotes, with the biggest quote being first in the list.
    const percentToSortedQuotes = lodash_1.default.mapValues(percentToQuotes, (routeQuotes) => {
        return routeQuotes.sort((routeQuoteA, routeQuoteB) => {
            if (routeType == sdk_core_1.TradeType.EXACT_INPUT) {
                return by(routeQuoteA).greaterThan(by(routeQuoteB)) ? -1 : 1;
            }
            else {
                return by(routeQuoteA).lessThan(by(routeQuoteB)) ? -1 : 1;
            }
        });
    });
    const quoteCompFn = routeType == sdk_core_1.TradeType.EXACT_INPUT
        ? (a, b) => a.greaterThan(b)
        : (a, b) => a.lessThan(b);
    const sumFn = (currencyAmounts) => {
        let sum = currencyAmounts[0];
        for (let i = 1; i < currencyAmounts.length; i++) {
            sum = sum.add(currencyAmounts[i]);
        }
        return sum;
    };
    let bestQuote;
    let bestSwap;
    // Min-heap for tracking the 5 best swaps given some number of splits.
    const bestSwapsPerSplit = new fixed_reverse_heap_1.default(Array, (a, b) => {
        return quoteCompFn(a.quote, b.quote) ? -1 : 1;
    }, 3);
    const { minSplits, maxSplits, forceCrossProtocol } = routingConfig;
    if (!percentToSortedQuotes[100] || minSplits > 1 || forceCrossProtocol) {
        log_1.log.info({
            percentToSortedQuotes: lodash_1.default.mapValues(percentToSortedQuotes, (p) => p.length),
        }, 'Did not find a valid route without any splits. Continuing search anyway.');
    }
    else {
        bestQuote = by(percentToSortedQuotes[100][0]);
        bestSwap = [percentToSortedQuotes[100][0]];
        for (const routeWithQuote of percentToSortedQuotes[100].slice(0, 5)) {
            bestSwapsPerSplit.push({
                quote: by(routeWithQuote),
                routes: [routeWithQuote],
            });
        }
    }
    // We do a BFS. Each additional node in a path represents us adding an additional split to the route.
    const queue = new queue_1.default();
    // First we seed BFS queue with the best quotes for each percentage.
    // i.e. [best quote when sending 10% of amount, best quote when sending 20% of amount, ...]
    // We will explore the various combinations from each node.
    for (let i = percents.length; i >= 0; i--) {
        const percent = percents[i];
        if (!percentToSortedQuotes[percent]) {
            continue;
        }
        queue.enqueue({
            curRoutes: [percentToSortedQuotes[percent][0]],
            percentIndex: i,
            remainingPercent: 100 - percent,
            special: false,
        });
        if (!percentToSortedQuotes[percent] ||
            !percentToSortedQuotes[percent][1]) {
            continue;
        }
        queue.enqueue({
            curRoutes: [percentToSortedQuotes[percent][1]],
            percentIndex: i,
            remainingPercent: 100 - percent,
            special: true,
        });
    }
    let splits = 1;
    let startedSplit = Date.now();
    while (queue.size > 0) {
        metric_1.metric.putMetric(`Split${splits}Done`, Date.now() - startedSplit, metric_1.MetricLoggerUnit.Milliseconds);
        startedSplit = Date.now();
        log_1.log.info({
            top5: lodash_1.default.map(Array.from(bestSwapsPerSplit.consume()), (q) => `${q.quote.toExact()} (${(0, lodash_1.default)(q.routes)
                .map((r) => r.toString())
                .join(', ')})`),
            onQueue: queue.size,
        }, `Top 3 with ${splits} splits`);
        bestSwapsPerSplit.clear();
        // Size of the queue at this point is the number of potential routes we are investigating for the given number of splits.
        let layer = queue.size;
        splits++;
        // If we didn't improve our quote by adding another split, very unlikely to improve it by splitting more after that.
        if (splits >= 3 && bestSwap && bestSwap.length < splits - 1) {
            break;
        }
        if (splits > maxSplits) {
            log_1.log.info('Max splits reached. Stopping search.');
            metric_1.metric.putMetric(`MaxSplitsHitReached`, 1, metric_1.MetricLoggerUnit.Count);
            break;
        }
        while (layer > 0) {
            layer--;
            const { remainingPercent, curRoutes, percentIndex, special } = queue.dequeue();
            // For all other percentages, add a new potential route.
            // E.g. if our current aggregated route if missing 50%, we will create new nodes and add to the queue for:
            // 50% + new 10% route, 50% + new 20% route, etc.
            for (let i = percentIndex; i >= 0; i--) {
                const percentA = percents[i];
                if (percentA > remainingPercent) {
                    continue;
                }
                // At some point the amount * percentage is so small that the quoter is unable to get
                // a quote. In this case there could be no quotes for that percentage.
                if (!percentToSortedQuotes[percentA]) {
                    continue;
                }
                const candidateRoutesA = percentToSortedQuotes[percentA];
                // Find the best route in the complimentary percentage that doesn't re-use a pool already
                // used in the current route. Re-using pools is not allowed as each swap through a pool changes its liquidity,
                // so it would make the quotes inaccurate.
                const routeWithQuoteA = findFirstRouteNotUsingUsedPools(curRoutes, candidateRoutesA, forceCrossProtocol);
                if (!routeWithQuoteA) {
                    continue;
                }
                const remainingPercentNew = remainingPercent - percentA;
                const curRoutesNew = [...curRoutes, routeWithQuoteA];
                // If we've found a route combination that uses all 100%, and it has at least minSplits, update our best route.
                if (remainingPercentNew == 0 && splits >= minSplits) {
                    const quotesNew = lodash_1.default.map(curRoutesNew, (r) => by(r));
                    const quoteNew = sumFn(quotesNew);
                    let gasCostL1QuoteToken = amounts_1.CurrencyAmount.fromRawAmount(quoteNew.currency, 0);
                    if (util_1.HAS_L1_FEE.includes(chainId)) {
                        const onlyV3Routes = curRoutesNew.every((route) => route.protocol == router_sdk_1.Protocol.V3);
                        if (gasModel == undefined || !onlyV3Routes) {
                            throw new Error("Can't compute L1 gas fees.");
                        }
                        else {
                            const gasCostL1 = await gasModel.calculateL1GasFees(curRoutesNew);
                            gasCostL1QuoteToken = gasCostL1.gasCostL1QuoteToken;
                        }
                    }
                    const quoteAfterL1Adjust = routeType == sdk_core_1.TradeType.EXACT_INPUT
                        ? quoteNew.subtract(gasCostL1QuoteToken)
                        : quoteNew.add(gasCostL1QuoteToken);
                    bestSwapsPerSplit.push({
                        quote: quoteAfterL1Adjust,
                        routes: curRoutesNew,
                    });
                    if (!bestQuote || quoteCompFn(quoteAfterL1Adjust, bestQuote)) {
                        bestQuote = quoteAfterL1Adjust;
                        bestSwap = curRoutesNew;
                        // Temporary experiment.
                        if (special) {
                            metric_1.metric.putMetric(`BestSwapNotPickingBestForPercent`, 1, metric_1.MetricLoggerUnit.Count);
                        }
                    }
                }
                else {
                    queue.enqueue({
                        curRoutes: curRoutesNew,
                        remainingPercent: remainingPercentNew,
                        percentIndex: i,
                        special,
                    });
                }
            }
        }
    }
    if (!bestSwap) {
        log_1.log.info(`Could not find a valid swap`);
        return undefined;
    }
    const postSplitNow = Date.now();
    let quoteGasAdjusted = sumFn(lodash_1.default.map(bestSwap, (routeWithValidQuote) => routeWithValidQuote.quoteAdjustedForGas));
    // this calculates the base gas used
    // if on L1, its the estimated gas used based on hops and ticks across all the routes
    // if on L2, its the gas used on the L2 based on hops and ticks across all the routes
    const estimatedGasUsed = (0, lodash_1.default)(bestSwap)
        .map((routeWithValidQuote) => routeWithValidQuote.gasEstimate)
        .reduce((sum, routeWithValidQuote) => sum.add(routeWithValidQuote), bignumber_1.BigNumber.from(0));
    if (!gas_models_1.usdGasTokensByChain[chainId] || !gas_models_1.usdGasTokensByChain[chainId][0]) {
        // Each route can use a different stablecoin to account its gas costs.
        // They should all be pegged, and this is just an estimate, so we do a merge
        // to an arbitrary stable.
        throw new Error(`Could not find a USD token for computing gas costs on ${chainId}`);
    }
    const usdToken = gas_models_1.usdGasTokensByChain[chainId][0];
    const usdTokenDecimals = usdToken.decimals;
    // if on L2, calculate the L1 security fee
    let gasCostsL1ToL2 = {
        gasUsedL1: bignumber_1.BigNumber.from(0),
        gasCostL1USD: amounts_1.CurrencyAmount.fromRawAmount(usdToken, 0),
        gasCostL1QuoteToken: amounts_1.CurrencyAmount.fromRawAmount((_a = bestSwap[0]) === null || _a === void 0 ? void 0 : _a.quoteToken, 0),
    };
    // If swapping on an L2 that includes a L1 security fee, calculate the fee and include it in the gas adjusted quotes
    if (util_1.HAS_L1_FEE.includes(chainId)) {
        // ensure the gasModel exists and that the swap route is a v3 only route
        const onlyV3Routes = bestSwap.every((route) => route.protocol == router_sdk_1.Protocol.V3);
        if (gasModel == undefined || !onlyV3Routes) {
            throw new Error("Can't compute L1 gas fees.");
        }
        else {
            gasCostsL1ToL2 = await gasModel.calculateL1GasFees(bestSwap);
        }
    }
    const { gasCostL1USD, gasCostL1QuoteToken } = gasCostsL1ToL2;
    // For each gas estimate, normalize decimals to that of the chosen usd token.
    const estimatedGasUsedUSDs = (0, lodash_1.default)(bestSwap)
        .map((routeWithValidQuote) => {
        const decimalsDiff = usdTokenDecimals - routeWithValidQuote.gasCostInUSD.currency.decimals;
        if (decimalsDiff == 0) {
            return amounts_1.CurrencyAmount.fromRawAmount(usdToken, routeWithValidQuote.gasCostInUSD.quotient);
        }
        return amounts_1.CurrencyAmount.fromRawAmount(usdToken, jsbi_1.default.multiply(routeWithValidQuote.gasCostInUSD.quotient, jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(decimalsDiff))).toString());
    })
        .value();
    let estimatedGasUsedUSD = sumFn(estimatedGasUsedUSDs);
    // if they are different usd pools, convert to the usdToken
    if (estimatedGasUsedUSD.currency != gasCostL1USD.currency) {
        const decimalsDiff = usdTokenDecimals - gasCostL1USD.currency.decimals;
        estimatedGasUsedUSD = estimatedGasUsedUSD.add(amounts_1.CurrencyAmount.fromRawAmount(usdToken, jsbi_1.default.multiply(gasCostL1USD.quotient, jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(decimalsDiff))).toString()));
    }
    else {
        estimatedGasUsedUSD = estimatedGasUsedUSD.add(gasCostL1USD);
    }
    log_1.log.info({
        estimatedGasUsedUSD: estimatedGasUsedUSD.toExact(),
        normalizedUsdToken: usdToken,
        routeUSDGasEstimates: lodash_1.default.map(bestSwap, (b) => `${b.percent}% ${(0, routes_1.routeToString)(b.route)} ${b.gasCostInUSD.toExact()}`),
        flatL1GasCostUSD: gasCostL1USD.toExact(),
    }, 'USD gas estimates of best route');
    const estimatedGasUsedQuoteToken = sumFn(lodash_1.default.map(bestSwap, (routeWithValidQuote) => routeWithValidQuote.gasCostInToken)).add(gasCostL1QuoteToken);
    const quote = sumFn(lodash_1.default.map(bestSwap, (routeWithValidQuote) => routeWithValidQuote.quote));
    // Adjust the quoteGasAdjusted for the l1 fee
    if (routeType == sdk_core_1.TradeType.EXACT_INPUT) {
        const quoteGasAdjustedForL1 = quoteGasAdjusted.subtract(gasCostL1QuoteToken);
        quoteGasAdjusted = quoteGasAdjustedForL1;
    }
    else {
        const quoteGasAdjustedForL1 = quoteGasAdjusted.add(gasCostL1QuoteToken);
        quoteGasAdjusted = quoteGasAdjustedForL1;
    }
    const routeWithQuotes = bestSwap.sort((routeAmountA, routeAmountB) => routeAmountB.amount.greaterThan(routeAmountA.amount) ? 1 : -1);
    metric_1.metric.putMetric('PostSplitDone', Date.now() - postSplitNow, metric_1.MetricLoggerUnit.Milliseconds);
    return {
        quote,
        quoteGasAdjusted,
        estimatedGasUsed,
        estimatedGasUsedUSD,
        estimatedGasUsedQuoteToken,
        routes: routeWithQuotes,
    };
}
exports.getBestSwapRouteBy = getBestSwapRouteBy;
// We do not allow pools to be re-used across split routes, as swapping through a pool changes the pools state.
// Given a list of used routes, this function finds the first route in the list of candidate routes that does not re-use an already used pool.
const findFirstRouteNotUsingUsedPools = (usedRoutes, candidateRouteQuotes, forceCrossProtocol) => {
    const poolAddressSet = new Set();
    const usedPoolAddresses = (0, lodash_1.default)(usedRoutes)
        .flatMap((r) => r.poolAddresses)
        .value();
    for (const poolAddress of usedPoolAddresses) {
        poolAddressSet.add(poolAddress);
    }
    const protocolsSet = new Set();
    const usedProtocols = (0, lodash_1.default)(usedRoutes)
        .flatMap((r) => r.protocol)
        .uniq()
        .value();
    for (const protocol of usedProtocols) {
        protocolsSet.add(protocol);
    }
    for (const routeQuote of candidateRouteQuotes) {
        const { poolAddresses, protocol } = routeQuote;
        if (poolAddresses.some((poolAddress) => poolAddressSet.has(poolAddress))) {
            continue;
        }
        // This code is just for debugging. Allows us to force a cross-protocol split route by skipping
        // consideration of routes that come from the same protocol as a used route.
        const needToForce = forceCrossProtocol && protocolsSet.size == 1;
        if (needToForce && protocolsSet.has(protocol)) {
            continue;
        }
        return routeQuote;
    }
    return null;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmVzdC1zd2FwLXJvdXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3JvdXRlcnMvYWxwaGEtcm91dGVyL2Z1bmN0aW9ucy9iZXN0LXN3YXAtcm91dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQXFEO0FBQ3JELG9EQUErQztBQUMvQyxnREFBOEM7QUFDOUMsZ0RBQXdCO0FBQ3hCLG9EQUF1QjtBQUN2QixzRkFBNEQ7QUFDNUQsNERBQW9DO0FBQ3BDLHdDQUFvRDtBQUNwRCxtREFBdUQ7QUFDdkQsMkNBQXdDO0FBQ3hDLGlEQUFnRTtBQUNoRSxpREFBMkU7QUFFM0UsOENBQStFO0FBTXhFLEtBQUssVUFBVSxnQkFBZ0IsQ0FDcEMsTUFBc0IsRUFDdEIsUUFBa0IsRUFDbEIscUJBQTRDLEVBQzVDLFNBQW9CLEVBQ3BCLE9BQWdCLEVBQ2hCLGFBQWdDLEVBQ2hDLFFBQTJDO0lBUzNDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUV2QixrRUFBa0U7SUFDbEUsb0dBQW9HO0lBQ3BHLE1BQU0sZUFBZSxHQUFpRCxFQUFFLENBQUM7SUFDekUsS0FBSyxNQUFNLG1CQUFtQixJQUFJLHFCQUFxQixFQUFFO1FBQ3ZELElBQUksQ0FBQyxlQUFlLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDakQsZUFBZSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNuRDtRQUNELGVBQWUsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztLQUN6RTtJQUVELGVBQU0sQ0FBQyxTQUFTLENBQ2QsaUNBQWlDLEVBQ2pDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQ2hCLHlCQUFnQixDQUFDLFlBQVksQ0FDOUIsQ0FBQztJQUVGLHlFQUF5RTtJQUN6RSxNQUFN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