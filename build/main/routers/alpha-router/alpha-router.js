"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlphaRouter = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const providers_1 = require("@ethersproject/providers");
const default_token_list_1 = __importDefault(require("@uniswap/default-token-list"));
const router_sdk_1 = require("@uniswap/router-sdk");
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const async_retry_1 = __importDefault(require("async-retry"));
const jsbi_1 = __importDefault(require("jsbi"));
const lodash_1 = __importDefault(require("lodash"));
const node_cache_1 = __importDefault(require("node-cache"));
const _1 = require(".");
const providers_2 = require("../../providers");
const caching_token_list_provider_1 = require("../../providers/caching-token-list-provider");
const token_provider_1 = require("../../providers/token-provider");
const token_validator_provider_1 = require("../../providers/token-validator-provider");
const pool_provider_1 = require("../../providers/v2/pool-provider");
const gas_data_provider_1 = require("../../providers/v3/gas-data-provider");
const pool_provider_2 = require("../../providers/v3/pool-provider");
const quote_provider_1 = require("../../providers/v3/quote-provider");
const chains_1 = require("../../util/chains");
const log_1 = require("../../util/log");
const methodParameters_1 = require("../../util/methodParameters");
const metric_1 = require("../../util/metric");
const routes_1 = require("../../util/routes");
const unsupported_tokens_1 = require("../../util/unsupported-tokens");
const router_1 = require("../router");
const config_1 = require("./config");
const route_with_valid_quote_1 = require("./entities/route-with-valid-quote");
const best_swap_route_1 = require("./functions/best-swap-route");
const calculate_ratio_amount_in_1 = require("./functions/calculate-ratio-amount-in");
const compute_all_routes_1 = require("./functions/compute-all-routes");
const get_candidate_pools_1 = require("./functions/get-candidate-pools");
const v2_heuristic_gas_model_1 = require("./gas-models/v2/v2-heuristic-gas-model");
class AlphaRouter {
    constructor({ chainId, provider, multicall2Provider, v3PoolProvider, v3QuoteProvider, v2PoolProvider, v2QuoteProvider, v2SubgraphProvider, tokenProvider, blockedTokenListProvider, v3SubgraphProvider, gasPriceProvider, v3GasModelFactory, v2GasModelFactory, swapRouterProvider, optimismGasDataProvider, tokenValidatorProvider, arbitrumGasDataProvider, }) {
        this.chainId = chainId;
        this.provider = provider;
        this.multicall2Provider =
            multicall2Provider !== null && multicall2Provider !== void 0 ? multicall2Provider : new providers_2.UniswapMulticallProvider(chainId, provider, 375000);
        this.v3PoolProvider =
            v3PoolProvider !== null && v3PoolProvider !== void 0 ? v3PoolProvider : new providers_2.CachingV3PoolProvider(this.chainId, new pool_provider_2.V3PoolProvider((0, chains_1.ID_TO_CHAIN_ID)(chainId), this.multicall2Provider), new providers_2.NodeJSCache(new node_cache_1.default({ stdTTL: 360, useClones: false })));
        if (v3QuoteProvider) {
            this.v3QuoteProvider = v3QuoteProvider;
        }
        else {
            switch (chainId) {
                case chains_1.ChainId.OPTIMISM:
                case chains_1.ChainId.OPTIMISTIC_KOVAN:
                    this.v3QuoteProvider = new quote_provider_1.V3QuoteProvider(chainId, provider, this.multicall2Provider, {
                        retries: 2,
                        minTimeout: 100,
                        maxTimeout: 1000,
                    }, {
                        multicallChunk: 110,
                        gasLimitPerCall: 1200000,
                        quoteMinSuccessRate: 0.1,
                    }, {
                        gasLimitOverride: 3000000,
                        multicallChunk: 45,
                    }, {
                        gasLimitOverride: 3000000,
                        multicallChunk: 45,
                    }, {
                        baseBlockOffset: -10,
                        rollback: {
                            enabled: true,
                            attemptsBeforeRollback: 1,
                            rollbackBlockOffset: -10,
                        },
                    });
                    break;
                case chains_1.ChainId.ARBITRUM_ONE:
                case chains_1.ChainId.ARBITRUM_RINKEBY:
                    this.v3QuoteProvider = new quote_provider_1.V3QuoteProvider(chainId, provider, this.multicall2Provider, {
                        retries: 2,
                        minTimeout: 100,
                        maxTimeout: 1000,
                    }, {
                        multicallChunk: 10,
                        gasLimitPerCall: 12000000,
                        quoteMinSuccessRate: 0.1,
                    }, {
                        gasLimitOverride: 30000000,
                        multicallChunk: 6,
                    }, {
                        gasLimitOverride: 30000000,
                        multicallChunk: 6,
                    });
                    break;
                default:
                    this.v3QuoteProvider = new quote_provider_1.V3QuoteProvider(chainId, provider, this.multicall2Provider, {
                        retries: 2,
                        minTimeout: 100,
                        maxTimeout: 1000,
                    }, {
                        multicallChunk: 210,
                        gasLimitPerCall: 705000,
                        quoteMinSuccessRate: 0.15,
                    }, {
                        gasLimitOverride: 2000000,
                        multicallChunk: 70,
                    });
                    break;
            }
        }
        this.v2PoolProvider =
            v2PoolProvider !== null && v2PoolProvider !== void 0 ? v2PoolProvider : new pool_provider_1.V2PoolProvider(chainId, this.multicall2Provider);
        this.v2QuoteProvider = v2QuoteProvider !== null && v2QuoteProvider !== void 0 ? v2QuoteProvider : new providers_2.V2QuoteProvider();
        this.blockedTokenListProvider =
            blockedTokenListProvider !== null && blockedTokenListProvider !== void 0 ? blockedTokenListProvider : new caching_token_list_provider_1.CachingTokenListProvider(chainId, unsupported_tokens_1.UNSUPPORTED_TOKENS, new providers_2.NodeJSCache(new node_cache_1.default({ stdTTL: 3600, useClones: false })));
        this.tokenProvider =
            tokenProvider !== null && tokenProvider !== void 0 ? tokenProvider : new providers_2.CachingTokenProviderWithFallback(chainId, new providers_2.NodeJSCache(new node_cache_1.default({ stdTTL: 3600, useClones: false })), new caching_token_list_provider_1.CachingTokenListProvider(chainId, default_token_list_1.default, new providers_2.NodeJSCache(new node_cache_1.default({ stdTTL: 3600, useClones: false }))), new token_provider_1.TokenProvider(chainId, this.multicall2Provider));
        const chainName = (0, chains_1.ID_TO_NETWORK_NAME)(chainId);
        // ipfs urls in the following format: `https://cloudflare-ipfs.com/ipns/api.uniswap.org/v1/pools/${protocol}/${chainName}.json`;
        if (v2SubgraphProvider) {
            this.v2SubgraphProvider = v2SubgraphProvider;
        }
        else {
            this.v2SubgraphProvider = new providers_2.V2SubgraphProviderWithFallBacks([
                new providers_2.CachingV2SubgraphProvider(chainId, new providers_2.URISubgraphProvider(chainId, `https://cloudflare-ipfs.com/ipns/api.uniswap.org/v1/pools/v2/${chainName}.json`, undefined, 0), new providers_2.NodeJSCache(new node_cache_1.default({ stdTTL: 300, useClones: false }))),
                new providers_2.StaticV2SubgraphProvider(chainId),
            ]);
        }
        if (v3SubgraphProvider) {
            this.v3SubgraphProvider = v3SubgraphProvider;
        }
        else {
            this.v3SubgraphProvider = new providers_2.V3SubgraphProviderWithFallBacks([
                new providers_2.CachingV3SubgraphProvider(chainId, new providers_2.URISubgraphProvider(chainId, `https://cloudflare-ipfs.com/ipns/api.uniswap.org/v1/pools/v3/${chainName}.json`, undefined, 0), new providers_2.NodeJSCache(new node_cache_1.default({ stdTTL: 300, useClones: false }))),
                new providers_2.StaticV3SubgraphProvider(chainId, this.v3PoolProvider),
            ]);
        }
        this.gasPriceProvider =
            gasPriceProvider !== null && gasPriceProvider !== void 0 ? gasPriceProvider : new providers_2.CachingGasStationProvider(chainId, this.provider instanceof providers_1.JsonRpcProvider
                ? new providers_2.OnChainGasPriceProvider(chainId, new providers_2.EIP1559GasPriceProvider(this.provider), new providers_2.LegacyGasPriceProvider(this.provider))
                : new providers_2.ETHGasStationInfoProvider(config_1.ETH_GAS_STATION_API_URL), new providers_2.NodeJSCache(new node_cache_1.default({ stdTTL: 15, useClones: false })));
        this.v3GasModelFactory =
            v3GasModelFactory !== null && v3GasModelFactory !== void 0 ? v3GasModelFactory : new _1.V3HeuristicGasModelFactory();
        this.v2GasModelFactory =
            v2GasModelFactory !== null && v2GasModelFactory !== void 0 ? v2GasModelFactory : new v2_heuristic_gas_model_1.V2HeuristicGasModelFactory();
        this.swapRouterProvider =
            swapRouterProvider !== null && swapRouterProvider !== void 0 ? swapRouterProvider : new providers_2.SwapRouterProvider(this.multicall2Provider);
        if (chainId == chains_1.ChainId.OPTIMISM || chainId == chains_1.ChainId.OPTIMISTIC_KOVAN) {
            this.l2GasDataProvider =
                optimismGasDataProvider !== null && optimismGasDataProvider !== void 0 ? optimismGasDataProvider : new gas_data_provider_1.OptimismGasDataProvider(chainId, this.multicall2Provider);
        }
        if (chainId == chains_1.ChainId.ARBITRUM_ONE ||
            chainId == chains_1.ChainId.ARBITRUM_RINKEBY) {
            this.l2GasDataProvider =
                arbitrumGasDataProvider !== null && arbitrumGasDataProvider !== void 0 ? arbitrumGasDataProvider : new gas_data_provider_1.ArbitrumGasDataProvider(chainId, this.provider);
        }
        if (tokenValidatorProvider) {
            this.tokenValidatorProvider = tokenValidatorProvider;
        }
        else if (this.chainId == chains_1.ChainId.MAINNET) {
            this.tokenValidatorProvider = new token_validator_provider_1.TokenValidatorProvider(this.chainId, this.multicall2Provider, new providers_2.NodeJSCache(new node_cache_1.default({ stdTTL: 30000, useClones: false })));
        }
    }
    async routeToRatio(token0Balance, token1Balance, position, swapAndAddConfig, swapAndAddOptions, routingConfig = (0, config_1.DEFAULT_ROUTING_CONFIG_BY_CHAIN)(this.chainId)) {
        if (token1Balance.currency.wrapped.sortsBefore(token0Balance.currency.wrapped)) {
            [token0Balance, token1Balance] = [token1Balance, token0Balance];
        }
        let preSwapOptimalRatio = this.calculateOptimalRatio(position, position.pool.sqrtRatioX96, true);
        // set up parameters according to which token will be swapped
        let zeroForOne;
        if (position.pool.tickCurrent > position.tickUpper) {
            zeroForOne = true;
        }
        else if (position.pool.tickCurrent < position.tickLower) {
            zeroForOne = false;
        }
        else {
            zeroForOne = new sdk_core_1.Fraction(token0Balance.quotient, token1Balance.quotient).greaterThan(preSwapOptimalRatio);
            if (!zeroForOne)
                preSwapOptimalRatio = preSwapOptimalRatio.invert();
        }
        const [inputBalance, outputBalance] = zeroForOne
            ? [token0Balance, token1Balance]
            : [token1Balance, token0Balance];
        let optimalRatio = preSwapOptimalRatio;
        let postSwapTargetPool = position.pool;
        let exchangeRate = zeroForOne
            ? position.pool.token0Price
            : position.pool.token1Price;
        let swap = null;
        let ratioAchieved = false;
        let n = 0;
        // iterate until we find a swap with a sufficient ratio or return null
        while (!ratioAchieved) {
            n++;
            if (n > swapAndAddConfig.maxIterations) {
                log_1.log.info('max iterations exceeded');
                return {
                    status: router_1.SwapToRatioStatus.NO_ROUTE_FOUND,
                    error: 'max iterations exceeded',
                };
            }
            const amountToSwap = (0, calculate_ratio_amount_in_1.calculateRatioAmountIn)(optimalRatio, exchangeRate, inputBalance, outputBalance);
            if (amountToSwap.equalTo(0)) {
                log_1.log.info(`no swap needed: amountToSwap = 0`);
                return {
                    status: router_1.SwapToRatioStatus.NO_SWAP_NEEDED,
                };
            }
            swap = await this.route(amountToSwap, outputBalance.currency, sdk_core_1.TradeType.EXACT_INPUT, undefined, Object.assign(Object.assign(Object.assign({}, (0, config_1.DEFAULT_ROUTING_CONFIG_BY_CHAIN)(this.chainId)), routingConfig), { protocols: [router_sdk_1.Protocol.V3, router_sdk_1.Protocol.V2] }));
            if (!swap) {
                log_1.log.info('no route found from this.route()');
                return {
                    status: router_1.SwapToRatioStatus.NO_ROUTE_FOUND,
                    error: 'no route found',
                };
            }
            const inputBalanceUpdated = inputBalance.subtract(swap.trade.inputAmount);
            const outputBalanceUpdated = outputBalance.add(swap.trade.outputAmount);
            const newRatio = inputBalanceUpdated.divide(outputBalanceUpdated);
            let targetPoolPriceUpdate;
            swap.route.forEach((route) => {
                if (route.protocol == router_sdk_1.Protocol.V3) {
                    const v3Route = route;
                    v3Route.route.pools.forEach((pool, i) => {
                        if (pool.token0.equals(position.pool.token0) &&
                            pool.token1.equals(position.pool.token1) &&
                            pool.fee == position.pool.fee) {
                            targetPoolPriceUpdate = jsbi_1.default.BigInt(v3Route.sqrtPriceX96AfterList[i].toString());
                            optimalRatio = this.calculateOptimalRatio(position, jsbi_1.default.BigInt(targetPoolPriceUpdate.toString()), zeroForOne);
                        }
                    });
                }
            });
            if (!targetPoolPriceUpdate) {
                optimalRatio = preSwapOptimalRatio;
            }
            ratioAchieved =
                newRatio.equalTo(optimalRatio) ||
                    this.absoluteValue(newRatio.asFraction.divide(optimalRatio).subtract(1)).lessThan(swapAndAddConfig.ratioErrorTolerance);
            if (ratioAchieved && targetPoolPriceUpdate) {
                postSwapTargetPool = new v3_sdk_1.Pool(position.pool.token0, position.pool.token1, position.pool.fee, targetPoolPriceUpdate, position.pool.liquidity, v3_sdk_1.TickMath.getTickAtSqrtRatio(targetPoolPriceUpdate), position.pool.tickDataProvider);
            }
            exchangeRate = swap.trade.outputAmount.divide(swap.trade.inputAmount);
            log_1.log.info({
                exchangeRate: exchangeRate.asFraction.toFixed(18),
                optimalRatio: optimalRatio.asFraction.toFixed(18),
                newRatio: newRatio.asFraction.toFixed(18),
                inputBalanceUpdated: inputBalanceUpdated.asFraction.toFixed(18),
                outputBalanceUpdated: outputBalanceUpdated.asFraction.toFixed(18),
                ratioErrorTolerance: swapAndAddConfig.ratioErrorTolerance.toFixed(18),
                iterationN: n.toString(),
            }, 'QuoteToRatio Iteration Parameters');
            if (exchangeRate.equalTo(0)) {
                log_1.log.info('exchangeRate to 0');
                return {
                    status: router_1.SwapToRatioStatus.NO_ROUTE_FOUND,
                    error: 'insufficient liquidity to swap to optimal ratio',
                };
            }
        }
        if (!swap) {
            return {
                status: router_1.SwapToRatioStatus.NO_ROUTE_FOUND,
                error: 'no route found',
            };
        }
        let methodParameters;
        if (swapAndAddOptions) {
            methodParameters = await this.buildSwapAndAddMethodParameters(swap.trade, swapAndAddOptions, {
                initialBalanceTokenIn: inputBalance,
                initialBalanceTokenOut: outputBalance,
                preLiquidityPosition: position,
            });
        }
        return {
            status: router_1.SwapToRatioStatus.SUCCESS,
            result: Object.assign(Object.assign({}, swap), { methodParameters, optimalRatio, postSwapTargetPool }),
        };
    }
    /**
     * @inheritdoc IRouter
     */
    async route(amount, quoteCurrency, tradeType, swapConfig, partialRoutingConfig = {}) {
        var _a;
        metric_1.metric.putMetric(`QuoteRequestedForChain${this.chainId}`, 1, metric_1.MetricLoggerUnit.Count);
        // Get a block number to specify in all our calls. Ensures data we fetch from chain is
        // from the same block.
        const blockNumber = (_a = partialRoutingConfig.blockNumber) !== null && _a !== void 0 ? _a : this.getBlockNumberPromise();
        const routingConfig = lodash_1.default.merge({}, (0, config_1.DEFAULT_ROUTING_CONFIG_BY_CHAIN)(this.chainId), partialRoutingConfig, { blockNumber });
        const { protocols } = routingConfig;
        const currencyIn = tradeType == sdk_core_1.TradeType.EXACT_INPUT ? amount.currency : quoteCurrency;
        const currencyOut = tradeType == sdk_core_1.TradeType.EXACT_INPUT ? quoteCurrency : amount.currency;
        const tokenIn = currencyIn.wrapped;
        const tokenOut = currencyOut.wrapped;
        // Generate our distribution of amounts, i.e. fractions of the input amount.
        // We will get quotes for fractions of the input amount for different routes, then
        // combine to generate split routes.
        const [percents, amounts] = this.getAmountDistribution(amount, routingConfig);
        // Get an estimate of the gas price to use when estimating gas cost of different routes.
        const beforeGas = Date.now();
        const { gasPriceWei } = await this.gasPriceProvider.getGasPrice();
        metric_1.metric.putMetric('GasPriceLoad', Date.now() - beforeGas, metric_1.MetricLoggerUnit.Milliseconds);
        const quoteToken = quoteCurrency.wrapped;
        const quotePromises = [];
        const protocolsSet = new Set(protocols !== null && protocols !== void 0 ? protocols : []);
        let gasModel = null;
        if (protocolsSet.size == 0 || protocolsSet.has(router_sdk_1.Protocol.V3)) {
            log_1.log.info({ protocols, tradeType }, 'Routing across V3');
            gasModel = await this.v3GasModelFactory.buildGasModel(this.chainId, gasPriceWei, this.v3PoolProvider, quoteToken, this.l2GasDataProvider);
            quotePromises.push(this.getV3Quotes(tokenIn, tokenOut, amounts, percents, quoteToken, gasModel, tradeType, routingConfig));
        }
        console.log('V2_SUPPORTED');
        console.log(chains_1.V2_SUPPORTED);
        if ((protocolsSet.size == 0 || protocolsSet.has(router_sdk_1.Protocol.V2)) &&
            chains_1.V2_SUPPORTED.includes(this.chainId)) {
            log_1.log.info({ protocols, swapType: tradeType }, 'Routing across V2');
            quotePromises.push(this.getV2Quotes(tokenIn, tokenOut, amounts, percents, quoteToken, gasPriceWei, tradeType, routingConfig));
        }
        const routesWithValidQuotesByProtocol = await Promise.all(quotePromises);
        let allRoutesWithValidQuotes = [];
        let allCandidatePools = [];
        for (const { routesWithValidQuotes, candidatePools, } of routesWithValidQuotesByProtocol) {
            allRoutesWithValidQuotes = [
                ...allRoutesWithValidQuotes,
                ...routesWithValidQuotes,
            ];
            allCandidatePools = [...allCandidatePools, candidatePools];
        }
        if (allRoutesWithValidQuotes.length == 0) {
            log_1.log.info({ allRoutesWithValidQuotes }, 'Received no valid quotes');
            return null;
        }
        // Given all the quotes for all the amounts for all the routes, find the best combination.
        const beforeBestSwap = Date.now();
        const swapRouteRaw = await (0, best_swap_route_1.getBestSwapRoute)(amount, percents, allRoutesWithValidQuotes, tradeType, this.chainId, routingConfig, undefined);
        if (!swapRouteRaw) {
            return null;
        }
        const { quote, quoteGasAdjusted, estimatedGasUsed, routes: routeAmounts, estimatedGasUsedQuoteToken, estimatedGasUsedUSD, } = swapRouteRaw;
        // Build Trade object that represents the optimal swap.
        const trade = (0, methodParameters_1.buildTrade)(currencyIn, currencyOut, tradeType, routeAmounts);
        let methodParameters;
        // If user provided recipient, deadline etc. we also generate the calldata required to execute
        // the swap and return it too.
        if (swapConfig) {
            methodParameters = (0, methodParameters_1.buildSwapMethodParameters)(trade, swapConfig);
        }
        metric_1.metric.putMetric('FindBestSwapRoute', Date.now() - beforeBestSwap, metric_1.MetricLoggerUnit.Milliseconds);
        metric_1.metric.putMetric(`QuoteFoundForChain${this.chainId}`, 1, metric_1.MetricLoggerUnit.Count);
        this.emitPoolSelectionMetrics(swapRouteRaw, allCandidatePools);
        return {
            quote,
            quoteGasAdjusted,
            estimatedGasUsed,
            estimatedGasUsedQuoteToken,
            estimatedGasUsedUSD,
            gasPriceWei,
            route: routeAmounts,
            trade,
            methodParameters,
            blockNumber: bignumber_1.BigNumber.from(await blockNumber),
        };
    }
    async applyTokenValidatorToPools(pools, isInvalidFn) {
        if (!this.tokenValidatorProvider) {
            return pools;
        }
        log_1.log.info(`Running token validator on ${pools.length} pools`);
        const tokens = lodash_1.default.flatMap(pools, (pool) => [pool.token0, pool.token1]);
        const tokenValidationResults = await this.tokenValidatorProvider.validateTokens(tokens);
        const poolsFiltered = lodash_1.default.filter(pools, (pool) => {
            const token0Validation = tokenValidationResults.getValidationByToken(pool.token0);
            const token1Validation = tokenValidationResults.getValidationByToken(pool.token1);
            const token0Invalid = isInvalidFn(pool.token0, token0Validation);
            const token1Invalid = isInvalidFn(pool.token1, token1Validation);
            if (token0Invalid || token1Invalid) {
                log_1.log.info(`Dropping pool ${(0, routes_1.poolToString)(pool)} because token is invalid. ${pool.token0.symbol}: ${token0Validation}, ${pool.token1.symbol}: ${token1Validation}`);
            }
            return !token0Invalid && !token1Invalid;
        });
        return poolsFiltered;
    }
    async getV3Quotes(tokenIn, tokenOut, amounts, percents, quoteToken, gasModel, swapType, routingConfig) {
        log_1.log.info('Starting to get V3 quotes');
        // Fetch all the pools that we will consider routing via. There are thousands
        // of pools, so we filter them to a set of candidate pools that we expect will
        // result in good prices.
        const { poolAccessor, candidatePools } = await (0, get_candidate_pools_1.getV3CandidatePools)({
            tokenIn,
            tokenOut,
            tokenProvider: this.tokenProvider,
            blockedTokenListProvider: this.blockedTokenListProvider,
            poolProvider: this.v3PoolProvider,
            routeType: swapType,
            subgraphProvider: this.v3SubgraphProvider,
            routingConfig,
            chainId: this.chainId,
        });
        const poolsRaw = poolAccessor.getAllPools();
        // Drop any pools that contain fee on transfer tokens (not supported by v3) or have issues with being transferred.
        const pools = await this.applyTokenValidatorToPools(poolsRaw, (token, tokenValidation) => {
            // If there is no available validation result we assume the token is fine.
            if (!tokenValidation) {
                return false;
            }
            // Only filters out *intermediate* pools that involve tokens that we detect
            // cant be transferred. This prevents us trying to route through tokens that may
            // not be transferrable, but allows users to still swap those tokens if they
            // specify.
            //
            if (tokenValidation == token_validator_provider_1.TokenValidationResult.STF &&
                (token.equals(tokenIn) || token.equals(tokenOut))) {
                return false;
            }
            return (tokenValidation == token_validator_provider_1.TokenValidationResult.FOT ||
                tokenValidation == token_validator_provider_1.TokenValidationResult.STF);
        });
        // Given all our candidate pools, compute all the possible ways to route from tokenIn to tokenOut.
        const { maxSwapsPerPath } = routingConfig;
        const routes = (0, compute_all_routes_1.computeAllV3Routes)(tokenIn, tokenOut, pools, maxSwapsPerPath);
        if (routes.length == 0) {
            return { routesWithValidQuotes: [], candidatePools };
        }
        // For all our routes, and all the fractional amounts, fetch quotes on-chain.
        const quoteFn = swapType == sdk_core_1.TradeType.EXACT_INPUT
            ? this.v3QuoteProvider.getQuotesManyExactIn.bind(this.v3QuoteProvider)
            : this.v3QuoteProvider.getQuotesManyExactOut.bind(this.v3QuoteProvider);
        const beforeQuotes = Date.now();
        log_1.log.info(`Getting quotes for V3 for ${routes.length} routes with ${amounts.length} amounts per route.`);
        const { routesWithQuotes } = await quoteFn(amounts, routes, {
            blockNumber: routingConfig.blockNumber,
        });
        metric_1.metric.putMetric('V3QuotesLoad', Date.now() - beforeQuotes, metric_1.MetricLoggerUnit.Milliseconds);
        metric_1.metric.putMetric('V3QuotesFetched', (0, lodash_1.default)(routesWithQuotes)
            .map(([, quotes]) => quotes.length)
            .sum(), metric_1.MetricLoggerUnit.Count);
        const routesWithValidQuotes = [];
        for (const routeWithQuote of routesWithQuotes) {
            const [route, quotes] = routeWithQuote;
            for (let i = 0; i < quotes.length; i++) {
                const percent = percents[i];
                const amountQuote = quotes[i];
                const { quote, amount, sqrtPriceX96AfterList, initializedTicksCrossedList, gasEstimate, } = amountQuote;
                if (!quote ||
                    !sqrtPriceX96AfterList ||
                    !initializedTicksCrossedList ||
                    !gasEstimate) {
                    log_1.log.debug({
                        route: (0, routes_1.routeToString)(route),
                        amountQuote,
                    }, 'Dropping a null V3 quote for route.');
                    continue;
                }
                const routeWithValidQuote = new route_with_valid_quote_1.V3RouteWithValidQuote({
                    route,
                    rawQuote: quote,
                    amount,
                    percent,
                    sqrtPriceX96AfterList,
                    initializedTicksCrossedList,
                    quoterGasEstimate: gasEstimate,
                    gasModel,
                    quoteToken,
                    tradeType: swapType,
                    v3PoolProvider: this.v3PoolProvider,
                });
                routesWithValidQuotes.push(routeWithValidQuote);
            }
        }
        return { routesWithValidQuotes, candidatePools };
    }
    async getV2Quotes(tokenIn, tokenOut, amounts, percents, quoteToken, gasPriceWei, swapType, routingConfig) {
        log_1.log.info('Starting to get V2 quotes');
        // Fetch all the pools that we will consider routing via. There are thousands
        // of pools, so we filter them to a set of candidate pools that we expect will
        // result in good prices.
        const { poolAccessor, candidatePools } = await (0, get_candidate_pools_1.getV2CandidatePools)({
            tokenIn,
            tokenOut,
            tokenProvider: this.tokenProvider,
            blockedTokenListProvider: this.blockedTokenListProvider,
            poolProvider: this.v2PoolProvider,
            routeType: swapType,
            subgraphProvider: this.v2SubgraphProvider,
            routingConfig,
            chainId: this.chainId,
        });
        const poolsRaw = poolAccessor.getAllPools();
        // Drop any pools that contain tokens that can not be transferred according to the token validator.
        const pools = await this.applyTokenValidatorToPools(poolsRaw, (token, tokenValidation) => {
            // If there is no available validation result we assume the token is fine.
            if (!tokenValidation) {
                return false;
            }
            // Only filters out *intermediate* pools that involve tokens that we detect
            // cant be transferred. This prevents us trying to route through tokens that may
            // not be transferrable, but allows users to still swap those tokens if they
            // specify.
            if (tokenValidation == token_validator_provider_1.TokenValidationResult.STF &&
                (token.equals(tokenIn) || token.equals(tokenOut))) {
                return false;
            }
            return tokenValidation == token_validator_provider_1.TokenValidationResult.STF;
        });
        // Given all our candidate pools, compute all the possible ways to route from tokenIn to tokenOut.
        const { maxSwapsPerPath } = routingConfig;
        const routes = (0, compute_all_routes_1.computeAllV2Routes)(tokenIn, tokenOut, pools, maxSwapsPerPath);
        if (routes.length == 0) {
            return { routesWithValidQuotes: [], candidatePools };
        }
        // For all our routes, and all the fractional amounts, fetch quotes on-chain.
        const quoteFn = swapType == sdk_core_1.TradeType.EXACT_INPUT
            ? this.v2QuoteProvider.getQuotesManyExactIn.bind(this.v2QuoteProvider)
            : this.v2QuoteProvider.getQuotesManyExactOut.bind(this.v2QuoteProvider);
        const beforeQuotes = Date.now();
        log_1.log.info(`Getting quotes for V2 for ${routes.length} routes with ${amounts.length} amounts per route.`);
        const { routesWithQuotes } = await quoteFn(amounts, routes);
        const gasModel = await this.v2GasModelFactory.buildGasModel(this.chainId, gasPriceWei, this.v2PoolProvider, quoteToken);
        metric_1.metric.putMetric('V2QuotesLoad', Date.now() - beforeQuotes, metric_1.MetricLoggerUnit.Milliseconds);
        metric_1.metric.putMetric('V2QuotesFetched', (0, lodash_1.default)(routesWithQuotes)
            .map(([, quotes]) => quotes.length)
            .sum(), metric_1.MetricLoggerUnit.Count);
        const routesWithValidQuotes = [];
        for (const routeWithQuote of routesWithQuotes) {
            const [route, quotes] = routeWithQuote;
            for (let i = 0; i < quotes.length; i++) {
                const percent = percents[i];
                const amountQuote = quotes[i];
                const { quote, amount } = amountQuote;
                if (!quote) {
                    log_1.log.debug({
                        route: (0, routes_1.routeToString)(route),
                        amountQuote,
                    }, 'Dropping a null V2 quote for route.');
                    continue;
                }
                const routeWithValidQuote = new route_with_valid_quote_1.V2RouteWithValidQuote({
                    route,
                    rawQuote: quote,
                    amount,
                    percent,
                    gasModel,
                    quoteToken,
                    tradeType: swapType,
                    v2PoolProvider: this.v2PoolProvider,
                });
                routesWithValidQuotes.push(routeWithValidQuote);
            }
        }
        return { routesWithValidQuotes, candidatePools };
    }
    // Note multiplications here can result in a loss of precision in the amounts (e.g. taking 50% of 101)
    // This is reconcilled at the end of the algorithm by adding any lost precision to one of
    // the splits in the route.
    getAmountDistribution(amount, routingConfig) {
        const { distributionPercent } = routingConfig;
        const percents = [];
        const amounts = [];
        for (let i = 1; i <= 100 / distributionPercent; i++) {
            percents.push(i * distributionPercent);
            amounts.push(amount.multiply(new sdk_core_1.Fraction(i * distributionPercent, 100)));
        }
        return [percents, amounts];
    }
    async buildSwapAndAddMethodParameters(trade, swapAndAddOptions, swapAndAddParameters) {
        const { swapOptions: { recipient, slippageTolerance, deadline, inputTokenPermit }, addLiquidityOptions: addLiquidityConfig, } = swapAndAddOptions;
        const preLiquidityPosition = swapAndAddParameters.preLiquidityPosition;
        const finalBalanceTokenIn = swapAndAddParameters.initialBalanceTokenIn.subtract(trade.inputAmount);
        const finalBalanceTokenOut = swapAndAddParameters.initialBalanceTokenOut.add(trade.outputAmount);
        const approvalTypes = await this.swapRouterProvider.getApprovalType(finalBalanceTokenIn, finalBalanceTokenOut);
        const zeroForOne = finalBalanceTokenIn.currency.wrapped.sortsBefore(finalBalanceTokenOut.currency.wrapped);
        return router_sdk_1.SwapRouter.swapAndAddCallParameters(trade, {
            recipient,
            slippageTolerance,
            deadlineOrPreviousBlockhash: deadline,
            inputTokenPermit,
        }, v3_sdk_1.Position.fromAmounts({
            pool: preLiquidityPosition.pool,
            tickLower: preLiquidityPosition.tickLower,
            tickUpper: preLiquidityPosition.tickUpper,
            amount0: zeroForOne
                ? finalBalanceTokenIn.quotient.toString()
                : finalBalanceTokenOut.quotient.toString(),
            amount1: zeroForOne
                ? finalBalanceTokenOut.quotient.toString()
                : finalBalanceTokenIn.quotient.toString(),
            useFullPrecision: false,
        }), addLiquidityConfig, approvalTypes.approvalTokenIn, approvalTypes.approvalTokenOut);
    }
    emitPoolSelectionMetrics(swapRouteRaw, allPoolsBySelection) {
        const poolAddressesUsed = new Set();
        const { routes: routeAmounts } = swapRouteRaw;
        (0, lodash_1.default)(routeAmounts)
            .flatMap((routeAmount) => {
            const { poolAddresses } = routeAmount;
            return poolAddresses;
        })
            .forEach((address) => {
            poolAddressesUsed.add(address.toLowerCase());
        });
        for (const poolsBySelection of allPoolsBySelection) {
            const { protocol } = poolsBySelection;
            lodash_1.default.forIn(poolsBySelection.selections, (pools, topNSelection) => {
                const topNUsed = lodash_1.default.findLastIndex(pools, (pool) => poolAddressesUsed.has(pool.id.toLowerCase())) + 1;
                metric_1.metric.putMetric(lodash_1.default.capitalize(`${protocol}${topNSelection}`), topNUsed, metric_1.MetricLoggerUnit.Count);
            });
        }
        let hasV3Route = false;
        let hasV2Route = false;
        for (const routeAmount of routeAmounts) {
            if (routeAmount.protocol == router_sdk_1.Protocol.V3) {
                hasV3Route = true;
            }
            if (routeAmount.protocol == router_sdk_1.Protocol.V2) {
                hasV2Route = true;
            }
        }
        if (hasV3Route && hasV2Route) {
            metric_1.metric.putMetric(`V3AndV2SplitRoute`, 1, metric_1.MetricLoggerUnit.Count);
            metric_1.metric.putMetric(`V3AndV2SplitRouteForChain${this.chainId}`, 1, metric_1.MetricLoggerUnit.Count);
        }
        else if (hasV3Route) {
            if (routeAmounts.length > 1) {
                metric_1.metric.putMetric(`V3SplitRoute`, 1, metric_1.MetricLoggerUnit.Count);
                metric_1.metric.putMetric(`V3SplitRouteForChain${this.chainId}`, 1, metric_1.MetricLoggerUnit.Count);
            }
            else {
                metric_1.metric.putMetric(`V3Route`, 1, metric_1.MetricLoggerUnit.Count);
                metric_1.metric.putMetric(`V3RouteForChain${this.chainId}`, 1, metric_1.MetricLoggerUnit.Count);
            }
        }
        else if (hasV2Route) {
            if (routeAmounts.length > 1) {
                metric_1.metric.putMetric(`V2SplitRoute`, 1, metric_1.MetricLoggerUnit.Count);
                metric_1.metric.putMetric(`V2SplitRouteForChain${this.chainId}`, 1, metric_1.MetricLoggerUnit.Count);
            }
            else {
                metric_1.metric.putMetric(`V2Route`, 1, metric_1.MetricLoggerUnit.Count);
                metric_1.metric.putMetric(`V2RouteForChain${this.chainId}`, 1, metric_1.MetricLoggerUnit.Count);
            }
        }
    }
    calculateOptimalRatio(position, sqrtRatioX96, zeroForOne) {
        const upperSqrtRatioX96 = v3_sdk_1.TickMath.getSqrtRatioAtTick(position.tickUpper);
        const lowerSqrtRatioX96 = v3_sdk_1.TickMath.getSqrtRatioAtTick(position.tickLower);
        // returns Fraction(0, 1) for any out of range position regardless of zeroForOne. Implication: function
        // cannot be used to determine the trading direction of out of range positions.
        if (jsbi_1.default.greaterThan(sqrtRatioX96, upperSqrtRatioX96) ||
            jsbi_1.default.lessThan(sqrtRatioX96, lowerSqrtRatioX96)) {
            return new sdk_core_1.Fraction(0, 1);
        }
        const precision = jsbi_1.default.BigInt('1' + '0'.repeat(18));
        let optimalRatio = new sdk_core_1.Fraction(v3_sdk_1.SqrtPriceMath.getAmount0Delta(sqrtRatioX96, upperSqrtRatioX96, precision, true), v3_sdk_1.SqrtPriceMath.getAmount1Delta(sqrtRatioX96, lowerSqrtRatioX96, precision, true));
        if (!zeroForOne)
            optimalRatio = optimalRatio.invert();
        return optimalRatio;
    }
    absoluteValue(fraction) {
        const numeratorAbs = jsbi_1.default.lessThan(fraction.numerator, jsbi_1.default.BigInt(0))
            ? jsbi_1.default.unaryMinus(fraction.numerator)
            : fraction.numerator;
        const denominatorAbs = jsbi_1.default.lessThan(fraction.denominator, jsbi_1.default.BigInt(0))
            ? jsbi_1.default.unaryMinus(fraction.denominator)
            : fraction.denominator;
        return new sdk_core_1.Fraction(numeratorAbs, denominatorAbs);
    }
    getBlockNumberPromise() {
        return (0, async_retry_1.default)(async (_b, attempt) => {
            if (attempt > 1) {
                log_1.log.info(`Get block number attempt ${attempt}`);
            }
            return this.provider.getBlockNumber();
        }, {
            retries: 2,
            minTimeout: 100,
            maxTimeout: 1000,
        });
    }
}
exports.AlphaRouter = AlphaRouter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxwaGEtcm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3JvdXRlcnMvYWxwaGEtcm91dGVyL2FscGhhLXJvdXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSx3REFBcUQ7QUFDckQsd0RBQXlFO0FBQ3pFLHFGQUE2RDtBQUM3RCxvREFBa0U7QUFDbEUsZ0RBQXlFO0FBR3pFLDRDQU15QjtBQUN6Qiw4REFBZ0M7QUFDaEMsZ0RBQXdCO0FBQ3hCLG9EQUF1QjtBQUN2Qiw0REFBbUM7QUFDbkMsd0JBQStDO0FBQy9DLCtDQXNCeUI7QUFDekIsNkZBR3FEO0FBS3JELG1FQUErRTtBQUMvRSx1RkFJa0Q7QUFDbEQsb0VBRzBDO0FBQzFDLDRFQU04QztBQUM5QyxvRUFHMEM7QUFDMUMsc0VBRzJDO0FBRzNDLDhDQUsyQjtBQUMzQix3Q0FBcUM7QUFDckMsa0VBR3FDO0FBQ3JDLDhDQUE2RDtBQUM3RCw4Q0FBZ0U7QUFDaEUsc0VBQW1FO0FBQ25FLHNDQVVtQjtBQUNuQixxQ0FHa0I7QUFDbEIsOEVBSTJDO0FBQzNDLGlFQUErRDtBQUMvRCxxRkFBK0U7QUFDL0UsdUVBR3dDO0FBQ3hDLHlFQUt5QztBQU16QyxtRkFBb0Y7QUF1THBGLE1BQWEsV0FBVztJQXlCdEIsWUFBWSxFQUNWLE9BQU8sRUFDUCxRQUFRLEVBQ1Isa0JBQWtCLEVBQ2xCLGNBQWMsRUFDZCxlQUFlLEVBQ2YsY0FBYyxFQUNkLGVBQWUsRUFDZixrQkFBa0IsRUFDbEIsYUFBYSxFQUNiLHdCQUF3QixFQUN4QixrQkFBa0IsRUFDbEIsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsa0JBQWtCLEVBQ2xCLHVCQUF1QixFQUN2QixzQkFBc0IsRUFDdEIsdUJBQXVCLEdBQ0w7UUFDbEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFD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