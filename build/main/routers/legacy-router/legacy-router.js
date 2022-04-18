"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyRouter = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const logger_1 = require("@ethersproject/logger");
const router_sdk_1 = require("@uniswap/router-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const lodash_1 = __importDefault(require("lodash"));
const token_provider_1 = require("../../providers/token-provider");
const amounts_1 = require("../../util/amounts");
const log_1 = require("../../util/log");
const routes_1 = require("../../util/routes");
const alpha_router_1 = require("../alpha-router");
const router_1 = require("../router");
const bases_1 = require("./bases");
// Interface defaults to 2.
const MAX_HOPS = 2;
/**
 * Replicates the router implemented in the V3 interface.
 * Code is mostly a copy from https://github.com/Uniswap/uniswap-interface/blob/0190b5a408c13016c87e1030ffc59326c085f389/src/hooks/useBestV3Trade.ts#L22-L23
 * with React/Redux hooks removed, and refactoring to allow re-use in other routers.
 */
class LegacyRouter {
    constructor({ chainId, multicall2Provider, poolProvider, quoteProvider, tokenProvider, }) {
        this.chainId = chainId;
        this.multicall2Provider = multicall2Provider;
        this.poolProvider = poolProvider;
        this.quoteProvider = quoteProvider;
        this.tokenProvider = tokenProvider;
    }
    async route(amount, quoteCurrency, swapType, swapConfig, partialRoutingConfig) {
        if (swapType == sdk_core_1.TradeType.EXACT_INPUT) {
            return this.routeExactIn(amount.currency, quoteCurrency, amount, swapConfig, partialRoutingConfig);
        }
        return this.routeExactOut(quoteCurrency, amount.currency, amount, swapConfig, partialRoutingConfig);
    }
    async routeExactIn(currencyIn, currencyOut, amountIn, swapConfig, routingConfig) {
        const tokenIn = currencyIn.wrapped;
        const tokenOut = currencyOut.wrapped;
        const routes = await this.getAllRoutes(tokenIn, tokenOut, routingConfig);
        const routeQuote = await this.findBestRouteExactIn(amountIn, tokenOut, routes, routingConfig);
        if (!routeQuote) {
            return null;
        }
        const trade = this.buildTrade(currencyIn, currencyOut, sdk_core_1.TradeType.EXACT_INPUT, routeQuote);
        return {
            quote: routeQuote.quote,
            quoteGasAdjusted: routeQuote.quote,
            route: [routeQuote],
            estimatedGasUsed: bignumber_1.BigNumber.from(0),
            estimatedGasUsedQuoteToken: amounts_1.CurrencyAmount.fromFractionalAmount(tokenOut, 0, 1),
            estimatedGasUsedUSD: amounts_1.CurrencyAmount.fromFractionalAmount(token_provider_1.DAI_MAINNET, 0, 1),
            gasPriceWei: bignumber_1.BigNumber.from(0),
            trade,
            methodParameters: swapConfig
                ? this.buildMethodParameters(trade, swapConfig)
                : undefined,
            blockNumber: bignumber_1.BigNumber.from(0),
        };
    }
    async routeExactOut(currencyIn, currencyOut, amountOut, swapConfig, routingConfig) {
        const tokenIn = currencyIn.wrapped;
        const tokenOut = currencyOut.wrapped;
        const routes = await this.getAllRoutes(tokenIn, tokenOut, routingConfig);
        const routeQuote = await this.findBestRouteExactOut(amountOut, tokenIn, routes, routingConfig);
        if (!routeQuote) {
            return null;
        }
        const trade = this.buildTrade(currencyIn, currencyOut, sdk_core_1.TradeType.EXACT_OUTPUT, routeQuote);
        return {
            quote: routeQuote.quote,
            quoteGasAdjusted: routeQuote.quote,
            route: [routeQuote],
            estimatedGasUsed: bignumber_1.BigNumber.from(0),
            estimatedGasUsedQuoteToken: amounts_1.CurrencyAmount.fromFractionalAmount(tokenIn, 0, 1),
            estimatedGasUsedUSD: amounts_1.CurrencyAmount.fromFractionalAmount(token_provider_1.DAI_MAINNET, 0, 1),
            gasPriceWei: bignumber_1.BigNumber.from(0),
            trade,
            methodParameters: swapConfig
                ? this.buildMethodParameters(trade, swapConfig)
                : undefined,
            blockNumber: bignumber_1.BigNumber.from(0),
        };
    }
    async findBestRouteExactIn(amountIn, tokenOut, routes, routingConfig) {
        const { routesWithQuotes: quotesRaw } = await this.quoteProvider.getQuotesManyExactIn([amountIn], routes, {
            blockNumber: routingConfig === null || routingConfig === void 0 ? void 0 : routingConfig.blockNumber,
        });
        const quotes100Percent = lodash_1.default.map(quotesRaw, ([route, quotes]) => { var _a, _b; return `${(0, routes_1.routeToString)(route)} : ${(_b = (_a = quotes[0]) === null || _a === void 0 ? void 0 : _a.quote) === null || _b === void 0 ? void 0 : _b.toString()}`; });
        log_1.log.info({ quotes100Percent }, '100% Quotes');
        const bestQuote = await this.getBestQuote(routes, quotesRaw, tokenOut, sdk_core_1.TradeType.EXACT_INPUT);
        return bestQuote;
    }
    async findBestRouteExactOut(amountOut, tokenIn, routes, routingConfig) {
        const { routesWithQuotes: quotesRaw } = await this.quoteProvider.getQuotesManyExactOut([amountOut], routes, {
            blockNumber: routingConfig === null || routingConfig === void 0 ? void 0 : routingConfig.blockNumber,
        });
        const bestQuote = await this.getBestQuote(routes, quotesRaw, tokenIn, sdk_core_1.TradeType.EXACT_OUTPUT);
        return bestQuote;
    }
    async getBestQuote(routes, quotesRaw, quoteToken, routeType) {
        log_1.log.debug(`Got ${lodash_1.default.filter(quotesRaw, ([_, quotes]) => !!quotes[0]).length} valid quotes from ${routes.length} possible routes.`);
        const routeQuotesRaw = [];
        for (let i = 0; i < quotesRaw.length; i++) {
            const [route, quotes] = quotesRaw[i];
            const { quote, amount } = quotes[0];
            if (!quote) {
                logger_1.Logger.globalLogger().debug(`No quote for ${(0, routes_1.routeToString)(route)}`);
                continue;
            }
            routeQuotesRaw.push({ route, quote, amount });
        }
        if (routeQuotesRaw.length == 0) {
            return null;
        }
        routeQuotesRaw.sort((routeQuoteA, routeQuoteB) => {
            if (routeType == sdk_core_1.TradeType.EXACT_INPUT) {
                return routeQuoteA.quote.gt(routeQuoteB.quote) ? -1 : 1;
            }
            else {
                return routeQuoteA.quote.lt(routeQuoteB.quote) ? -1 : 1;
            }
        });
        const routeQuotes = lodash_1.default.map(routeQuotesRaw, ({ route, quote, amount }) => {
            return new alpha_router_1.V3RouteWithValidQuote({
                route,
                rawQuote: quote,
                amount,
                percent: 100,
                gasModel: {
                    estimateGasCost: () => ({
                        gasCostInToken: amounts_1.CurrencyAmount.fromRawAmount(quoteToken, 0),
                        gasCostInUSD: amounts_1.CurrencyAmount.fromRawAmount(token_provider_1.USDC_MAINNET, 0),
                        gasEstimate: bignumber_1.BigNumber.from(0),
                    }),
                },
                sqrtPriceX96AfterList: [],
                initializedTicksCrossedList: [],
                quoterGasEstimate: bignumber_1.BigNumber.from(0),
                tradeType: routeType,
                quoteToken,
                v3PoolProvider: this.poolProvider,
            });
        });
        for (const rq of routeQuotes) {
            log_1.log.debug(`Quote: ${rq.amount.toFixed(Math.min(rq.amount.currency.decimals, 2))} Route: ${(0, routes_1.routeToString)(rq.route)}`);
        }
        return routeQuotes[0];
    }
    async getAllRoutes(tokenIn, tokenOut, routingConfig) {
        const tokenPairs = await this.getAllPossiblePairings(tokenIn, tokenOut);
        const poolAccessor = await this.poolProvider.getPools(tokenPairs, {
            blockNumber: routingConfig === null || routingConfig === void 0 ? void 0 : routingConfig.blockNumber,
        });
        const pools = poolAccessor.getAllPools();
        const routes = this.computeAllRoutes(tokenIn, tokenOut, pools, this.chainId, [], [], tokenIn, MAX_HOPS);
        log_1.log.info({ routes: lodash_1.default.map(routes, routes_1.routeToString) }, `Computed ${routes.length} possible routes.`);
        return routes;
    }
    async getAllPossiblePairings(tokenIn, tokenOut) {
        var _a, _b, _c, _d, _e;
        const common = (_a = (0, bases_1.BASES_TO_CHECK_TRADES_AGAINST)(this.tokenProvider)[this.chainId]) !== null && _a !== void 0 ? _a : [];
        const additionalA = (_c = (_b = (await (0, bases_1.ADDITIONAL_BASES)(this.tokenProvider))[this.chainId]) === null || _b === void 0 ? void 0 : _b[tokenIn.address]) !== null && _c !== void 0 ? _c : [];
        const additionalB = (_e = (_d = (await (0, bases_1.ADDITIONAL_BASES)(this.tokenProvider))[this.chainId]) === null || _d === void 0 ? void 0 : _d[tokenOut.address]) !== null && _e !== void 0 ? _e : [];
        const bases = [...common, ...additionalA, ...additionalB];
        const basePairs = lodash_1.default.flatMap(bases, (base) => bases.map((otherBase) => [base, otherBase]));
        const customBases = (await (0, bases_1.CUSTOM_BASES)(this.tokenProvider))[this.chainId];
        const allPairs = (0, lodash_1.default)([
            // the direct pair
            [tokenIn, tokenOut],
            // token A against all bases
            ...bases.map((base) => [tokenIn, base]),
            // token B against all bases
            ...bases.map((base) => [tokenOut, base]),
            // each base against all bases
            ...basePairs,
        ])
            .filter((tokens) => Boolean(tokens[0] && tokens[1]))
            .filter(([tokenA, tokenB]) => tokenA.address !== tokenB.address && !tokenA.equals(tokenB))
            .filter(([tokenA, tokenB]) => {
            const customBasesA = customBases === null || customBases === void 0 ? void 0 : customBases[tokenA.address];
            const customBasesB = customBases === null || customBases === void 0 ? void 0 : customBases[tokenB.address];
            if (!customBasesA && !customBasesB)
                return true;
            if (customBasesA && !customBasesA.find((base) => tokenB.equals(base)))
                return false;
            if (customBasesB && !customBasesB.find((base) => tokenA.equals(base)))
                return false;
            return true;
        })
            .flatMap(([tokenA, tokenB]) => {
            return [
                [tokenA, tokenB, v3_sdk_1.FeeAmount.LOW],
                [tokenA, tokenB, v3_sdk_1.FeeAmount.MEDIUM],
                [tokenA, tokenB, v3_sdk_1.FeeAmount.HIGH],
            ];
        })
            .value();
        return allPairs;
    }
    computeAllRoutes(tokenIn, tokenOut, pools, chainId, currentPath = [], allPaths = [], startTokenIn = tokenIn, maxHops = 2) {
        for (const pool of pools) {
            if (currentPath.indexOf(pool) !== -1 || !pool.involvesToken(tokenIn))
                continue;
            const outputToken = pool.token0.equals(tokenIn)
                ? pool.token1
                : pool.token0;
            if (outputToken.equals(tokenOut)) {
                allPaths.push(new router_1.V3Route([...currentPath, pool], startTokenIn, tokenOut));
            }
            else if (maxHops > 1) {
                this.computeAllRoutes(outputToken, tokenOut, pools, chainId, [...currentPath, pool], allPaths, startTokenIn, maxHops - 1);
            }
        }
        return allPaths;
    }
    buildTrade(tokenInCurrency, tokenOutCurrency, tradeType, routeAmount) {
        const { route, amount, quote } = routeAmount;
        // The route, amount and quote are all in terms of wrapped tokens.
        // When constructing the Trade object the inputAmount/outputAmount must
        // use native currencies if necessary. This is so that the Trade knows to wrap/unwrap.
        if (tradeType == sdk_core_1.TradeType.EXACT_INPUT) {
            const amountCurrency = amounts_1.CurrencyAmount.fromFractionalAmount(tokenInCurrency, amount.numerator, amount.denominator);
            const quoteCurrency = amounts_1.CurrencyAmount.fromFractionalAmount(tokenOutCurrency, quote.numerator, quote.denominator);
            const routeCurrency = new v3_sdk_1.Route(route.pools, amountCurrency.currency, quoteCurrency.currency);
            return new router_sdk_1.Trade({
                v3Routes: [
                    {
                        routev3: routeCurrency,
                        inputAmount: amountCurrency,
                        outputAmount: quoteCurrency,
                    },
                ],
                v2Routes: [],
                tradeType: tradeType,
            });
        }
        else {
            const quoteCurrency = amounts_1.CurrencyAmount.fromFractionalAmount(tokenInCurrency, quote.numerator, quote.denominator);
            const amountCurrency = amounts_1.CurrencyAmount.fromFractionalAmount(tokenOutCurrency, amount.numerator, amount.denominator);
            const routeCurrency = new v3_sdk_1.Route(route.pools, quoteCurrency.currency, amountCurrency.currency);
            return new router_sdk_1.Trade({
                v3Routes: [
                    {
                        routev3: routeCurrency,
                        inputAmount: quoteCurrency,
                        outputAmount: amountCurrency,
                    },
                ],
                v2Routes: [],
                tradeType: tradeType,
            });
        }
    }
    buildMethodParameters(trade, swapConfig) {
        const { recipient, slippageTolerance, deadline } = swapConfig;
        const methodParameters = router_sdk_1.SwapRouter.swapCallParameters(trade, {
            recipient,
            slippageTolerance,
            deadlineOrPreviousBlockhash: deadline,
            // ...(signatureData
            //   ? {
            //       inputTokenPermit:
            //         'allowed' in signatureData
            //           ? {
            //               expiry: signatureData.deadline,
            //               nonce: signatureData.nonce,
            //               s: signatureData.s,
            //               r: signatureData.r,
            //               v: signatureData.v as any,
            //             }
            //           : {
            //               deadline: signatureData.deadline,
            //               amount: signatureData.amount,
            //               s: signatureData.s,
            //               r: signatureData.r,
            //               v: signatureData.v as any,
            //             },
            //     }
            //   : {}),
        });
        return methodParameters;
    }
}
exports.LegacyRouter = LegacyRouter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGVnYWN5LXJvdXRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9yb3V0ZXJzL2xlZ2FjeS1yb3V0ZXIvbGVnYWN5LXJvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBcUQ7QUFDckQsa0RBQStDO0FBQy9DLG9EQUF3RDtBQUN4RCxnREFBK0Q7QUFDL0QsNENBQTJFO0FBQzNFLG9EQUF1QjtBQUV2QixtRUFJd0M7QUFNeEMsZ0RBQW9EO0FBRXBELHdDQUFxQztBQUNyQyw4Q0FBa0Q7QUFDbEQsa0RBQXdEO0FBQ3hELHNDQUFxRTtBQUNyRSxtQ0FJaUI7QUFVakIsMkJBQTJCO0FBQzNCLE1BQU0sUUFBUSxHQUFHLENBQUMsQ0FBQztBQU1uQjs7OztHQUlHO0FBQ0gsTUFBYSxZQUFZO0lBT3ZCLFlBQVksRUFDVixPQUFPLEVBQ1Asa0JBQWtCLEVBQ2xCLFlBQVksRUFDWixhQUFhLEVBQ2IsYUFBYSxHQUNNO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxrQkFBa0IsQ0FBQztRQUM3QyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztRQUNuQyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUNyQyxDQUFDO0lBQ00sS0FBSyxDQUFDLEtBQUssQ0FDaEIsTUFBc0IsRUFDdEIsYUFBdUIsRUFDdkIsUUFBbUIsRUFDbkIsVUFBd0IsRUFDeEIsb0JBQW1EO1FBRW5ELElBQUksUUFBUSxJQUFJLG9CQUFTLENBQUMsV0FBVyxFQUFFO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FDdEIsTUFBTSxDQUFDLFFBQVEsRUFDZixhQUFhLEVBQ2IsTUFBTSxFQUNOLFVBQVUsRUFDVixvQkFBb0IsQ0FDckIsQ0FBQztTQUNIO1FBRUQsT0FBTyxJQUFJ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