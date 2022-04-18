"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.V3HeuristicGasModelFactory = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const sdk_core_1 = require("@uniswap/sdk-core");
const v3_sdk_1 = require("@uniswap/v3-sdk");
const lodash_1 = __importDefault(require("lodash"));
const __1 = require("../../../..");
const util_1 = require("../../../../util");
const amounts_1 = require("../../../../util/amounts");
const log_1 = require("../../../../util/log");
const methodParameters_1 = require("../../../../util/methodParameters");
const gas_model_1 = require("../gas-model");
const gas_costs_1 = require("./gas-costs");
// Cost for crossing an uninitialized tick.
const COST_PER_UNINIT_TICK = bignumber_1.BigNumber.from(0);
/**
 * Computes a gas estimate for a V3 swap using heuristics.
 * Considers number of hops in the route, number of ticks crossed
 * and the typical base cost for a swap.
 *
 * We get the number of ticks crossed in a swap from the QuoterV2
 * contract.
 *
 * We compute gas estimates off-chain because
 *  1/ Calling eth_estimateGas for a swaps requires the caller to have
 *     the full balance token being swapped, and approvals.
 *  2/ Tracking gas used using a wrapper contract is not accurate with Multicall
 *     due to EIP-2929. We would have to make a request for every swap we wanted to estimate.
 *  3/ For V2 we simulate all our swaps off-chain so have no way to track gas used.
 *
 * @export
 * @class V3HeuristicGasModelFactory
 */
class V3HeuristicGasModelFactory extends gas_model_1.IV3GasModelFactory {
    constructor() {
        super();
    }
    async buildGasModel(chainId, gasPriceWei, poolProvider, token, l2GasDataProvider
    // this is the quoteToken
    ) {
        const l2GasData = l2GasDataProvider
            ? await l2GasDataProvider.getGasData()
            : undefined;
        const usdPool = await this.getHighestLiquidityUSDPool(chainId, poolProvider);
        const calculateL1GasFees = async (route) => {
            const swapOptions = {
                recipient: '0x0000000000000000000000000000000000000001',
                deadline: 100,
                slippageTolerance: new sdk_core_1.Percent(5, 10000),
            };
            let l1Used = bignumber_1.BigNumber.from(0);
            let l1FeeInWei = bignumber_1.BigNumber.from(0);
            if (chainId == util_1.ChainId.OPTIMISM || chainId == util_1.ChainId.OPTIMISTIC_KOVAN) {
                [l1Used, l1FeeInWei] = this.calculateOptimismToL1SecurityFee(route, swapOptions, l2GasData);
            }
            else if (chainId == util_1.ChainId.ARBITRUM_ONE ||
                chainId == util_1.ChainId.ARBITRUM_RINKEBY) {
                [l1Used, l1FeeInWei] = this.calculateArbitrumToL1SecurityFee(route, swapOptions, l2GasData);
            }
            // wrap fee to native currency
            const nativeCurrency = __1.WRAPPED_NATIVE_CURRENCY[chainId];
            const costNativeCurrency = amounts_1.CurrencyAmount.fromRawAmount(nativeCurrency, l1FeeInWei.toString());
            // convert fee into usd
            const nativeTokenPrice = usdPool.token0.address == nativeCurrency.address
                ? usdPool.token0Price
                : usdPool.token1Price;
            const gasCostL1USD = nativeTokenPrice.quote(costNativeCurrency);
            let gasCostL1QuoteToken = costNativeCurrency;
            // if the inputted token is not in the native currency, quote a native/quote token pool to get the gas cost in terms of the quote token
            if (!token.equals(nativeCurrency)) {
                const nativePool = await this.getHighestLiquidityNativePool(chainId, token, poolProvider);
                if (!nativePool) {
                    log_1.log.info('Could not find a pool to convert the cost into the quote token');
                    gasCostL1QuoteToken = amounts_1.CurrencyAmount.fromRawAmount(token, 0);
                }
                else {
                    const nativeTokenPrice = nativePool.token0.address == nativeCurrency.address
                        ? nativePool.token0Price
                        : nativePool.token1Price;
                    gasCostL1QuoteToken = nativeTokenPrice.quote(costNativeCurrency);
                }
            }
            // gasUsedL1 is the gas units used calculated from the bytes of the calldata
            // gasCostL1USD and gasCostL1QuoteToken is the cost of gas in each of those tokens
            return {
                gasUsedL1: l1Used,
                gasCostL1USD,
                gasCostL1QuoteToken,
            };
        };
        // If our quote token is WETH, we don't need to convert our gas use to be in terms
        // of the quote token in order to produce a gas adjusted amount.
        // We do return a gas use in USD however, so we still convert to usd.
        const nativeCurrency = __1.WRAPPED_NATIVE_CURRENCY[chainId];
        if (token.equals(nativeCurrency)) {
            const estimateGasCost = (routeWithValidQuote) => {
                const { totalGasCostNativeCurrency, baseGasUse } = this.estimateGas(routeWithValidQuote, gasPriceWei, chainId);
                const token0 = usdPool.token0.address == nativeCurrency.address;
                const nativeTokenPrice = token0
                    ? usdPool.token0Price
                    : usdPool.token1Price;
                const gasCostInTermsOfUSD = nativeTokenPrice.quote(totalGasCostNativeCurrency);
                return {
                    gasEstimate: baseGasUse,
                    gasCostInToken: totalGasCostNativeCurrency,
                    gasCostInUSD: gasCostInTermsOfUSD,
                };
            };
            return {
                estimateGasCost,
                calculateL1GasFees,
            };
        }
        // If the quote token is not in the native currency, we convert the gas cost to be in terms of the quote token.
        // We do this by getting the highest liquidity <quoteToken>/<nativeCurrency> pool. eg. <quoteToken>/ETH pool.
        const nativePool = await this.getHighestLiquidityNativePool(chainId, token, poolProvider);
        const usdToken = usdPool.token0.address == nativeCurrency.address
            ? usdPool.token1
            : usdPool.token0;
        const estimateGasCost = (routeWithValidQuote) => {
            const { totalGasCostNativeCurrency, baseGasUse } = this.estimateGas(routeWithValidQuote, gasPriceWei, chainId);
            if (!nativePool) {
                log_1.log.info(`Unable to find ${nativeCurrency.symbol} pool with the quote token, ${token.symbol} to produce gas adjusted costs. Route will not account for gas.`);
                return {
                    gasEstimate: baseGasUse,
                    gasCostInToken: amounts_1.CurrencyAmount.fromRawAmount(token, 0),
                    gasCostInUSD: amounts_1.CurrencyAmount.fromRawAmount(usdToken, 0),
                };
            }
            const token0 = nativePool.token0.address == nativeCurrency.address;
            // returns mid price in terms of the native currency (the ratio of quoteToken/nativeToken)
            const nativeTokenPrice = token0
                ? nativePool.token0Price
                : nativePool.token1Price;
            let gasCostInTermsOfQuoteToken;
            try {
                // native token is base currency
                gasCostInTermsOfQuoteToken = nativeTokenPrice.quote(totalGasCostNativeCurrency);
            }
            catch (err) {
                log_1.log.info({
                    nativeTokenPriceBase: nativeTokenPrice.baseCurrency,
                    nativeTokenPriceQuote: nativeTokenPrice.quoteCurrency,
                    gasCostInEth: totalGasCostNativeCurrency.currency,
                }, 'Debug eth price token issue');
                throw err;
            }
            // true if token0 is the native currency
            const token0USDPool = usdPool.token0.address == nativeCurrency.address;
            // gets the mid price of the pool in terms of the native token
            const nativeTokenPriceUSDPool = token0USDPool
                ? usdPool.token0Price
                : usdPool.token1Price;
            let gasCostInTermsOfUSD;
            try {
                gasCostInTermsOfUSD = nativeTokenPriceUSDPool.quote(totalGasCostNativeCurrency);
            }
            catch (err) {
                log_1.log.info({
                    usdT1: usdPool.token0.symbol,
                    usdT2: usdPool.token1.symbol,
                    gasCostInNativeToken: totalGasCostNativeCurrency.currency.symbol,
                }, 'Failed to compute USD gas price');
                throw err;
            }
            return {
                gasEstimate: baseGasUse,
                gasCostInToken: gasCostInTermsOfQuoteToken,
                gasCostInUSD: gasCostInTermsOfUSD,
            };
        };
        return {
            estimateGasCost: estimateGasCost.bind(this),
            calculateL1GasFees,
        };
    }
    estimateGas(routeWithValidQuote, gasPriceWei, chainId) {
        const totalInitializedTicksCrossed = bignumber_1.BigNumber.from(Math.max(1, lodash_1.default.sum(routeWithValidQuote.initializedTicksCrossedList)));
        const totalHops = bignumber_1.BigNumber.from(routeWithValidQuote.route.pools.length);
        const hopsGasUse = (0, gas_costs_1.COST_PER_HOP)(chainId).mul(totalHops);
        const tickGasUse = (0, gas_costs_1.COST_PER_INIT_TICK)(chainId).mul(totalInitializedTicksCrossed);
        const uninitializedTickGasUse = COST_PER_UNINIT_TICK.mul(0);
        // base estimate gas used based on chainId estimates for hops and ticks gas useage
        const baseGasUse = (0, gas_costs_1.BASE_SWAP_COST)(chainId)
            .add(hopsGasUse)
            .add(tickGasUse)
            .add(uninitializedTickGasUse);
        const baseGasCostWei = gasPriceWei.mul(baseGasUse);
        const wrappedCurrency = __1.WRAPPED_NATIVE_CURRENCY[chainId];
        const totalGasCostNativeCurrency = amounts_1.CurrencyAmount.fromRawAmount(wrappedCurrency, baseGasCostWei.toString());
        return {
            totalGasCostNativeCurrency,
            totalInitializedTicksCrossed,
            baseGasUse,
        };
    }
    async getHighestLiquidityNativePool(chainId, token, poolProvider) {
        const nativeCurrency = __1.WRAPPED_NATIVE_CURRENCY[chainId];
        const nativePools = (0, lodash_1.default)([v3_sdk_1.FeeAmount.HIGH, v3_sdk_1.FeeAmount.MEDIUM, v3_sdk_1.FeeAmount.LOW])
            .map((feeAmount) => {
            return [nativeCurrency, token, feeAmount];
        })
            .value();
        const poolAccessor = await poolProvider.getPools(nativePools);
        const pools = (0, lodash_1.default)([v3_sdk_1.FeeAmount.HIGH, v3_sdk_1.FeeAmount.MEDIUM, v3_sdk_1.FeeAmount.LOW])
            .map((feeAmount) => {
            return poolAccessor.getPool(nativeCurrency, token, feeAmount);
        })
            .compact()
            .value();
        if (pools.length == 0) {
            log_1.log.error({ pools }, `Could not find a ${nativeCurrency.symbol} pool with ${token.symbol} for computing gas costs.`);
            return null;
        }
        const maxPool = lodash_1.default.maxBy(pools, (pool) => pool.liquidity);
        return maxPool;
    }
    async getHighestLiquidityUSDPool(chainId, poolProvider) {
        const usdTokens = gas_model_1.usdGasTokensByChain[chainId];
        const wrappedCurrency = __1.WRAPPED_NATIVE_CURRENCY[chainId];
        if (!usdTokens) {
            throw new Error(`Could not find a USD token for computing gas costs on ${chainId}`);
        }
        const usdPools = (0, lodash_1.default)([
            v3_sdk_1.FeeAmount.HIGH,
            v3_sdk_1.FeeAmount.MEDIUM,
            v3_sdk_1.FeeAmount.LOW,
            v3_sdk_1.FeeAmount.LOWEST,
        ])
            .flatMap((feeAmount) => {
            return lodash_1.default.map(usdTokens, (usdToken) => [wrappedCurrency, usdToken, feeAmount]);
        })
            .value();
        const poolAccessor = await poolProvider.getPools(usdPools);
        const pools = (0, lodash_1.default)([
            v3_sdk_1.FeeAmount.HIGH,
            v3_sdk_1.FeeAmount.MEDIUM,
            v3_sdk_1.FeeAmount.LOW,
            v3_sdk_1.FeeAmount.LOWEST,
        ])
            .flatMap((feeAmount) => {
            const pools = [];
            for (const usdToken of usdTokens) {
                const pool = poolAccessor.getPool(wrappedCurrency, usdToken, feeAmount);
                if (pool) {
                    pools.push(pool);
                }
            }
            return pools;
        })
            .compact()
            .value();
        if (pools.length == 0) {
            log_1.log.error({ pools }, `Could not find a USD/${wrappedCurrency.symbol} pool for computing gas costs.`);
            throw new Error(`Can't find USD/${wrappedCurrency.symbol} pool for computing gas costs.`);
        }
        const maxPool = lodash_1.default.maxBy(pools, (pool) => pool.liquidity);
        return maxPool;
    }
    /**
     * To avoid having a call to optimism's L1 security fee contract for every route and amount combination,
     * we replicate the gas cost accounting here.
     */
    calculateOptimismToL1SecurityFee(routes, swapConfig, gasData) {
        const { l1BaseFee, scalar, decimals, overhead } = gasData;
        const route = routes[0];
        const inputToken = route.tradeType == sdk_core_1.TradeType.EXACT_INPUT
            ? route.amount.currency
            : route.quote.currency;
        const outputToken = route.tradeType == sdk_core_1.TradeType.EXACT_INPUT
            ? route.quote.currency
            : route.amount.currency;
        // build trade for swap calldata
        const trade = (0, methodParameters_1.buildTrade)(inputToken, outputToken, route.tradeType, routes);
        const data = (0, methodParameters_1.buildSwapMethodParameters)(trade, swapConfig).calldata;
        const l1GasUsed = this.getL2ToL1GasUsed(data, overhead);
        // l1BaseFee is L1 Gas Price on etherscan
        const l1Fee = l1GasUsed.mul(l1BaseFee);
        const unscaled = l1Fee.mul(scalar);
        // scaled = unscaled / (10 ** decimals)
        const scaledConversion = bignumber_1.BigNumber.from(10).pow(decimals);
        const scaled = unscaled.div(scaledConversion);
        return [l1GasUsed, scaled];
    }
    calculateArbitrumToL1SecurityFee(routes, swapConfig, gasData) {
        const { perL2TxFee, perL1CalldataFee } = gasData;
        const route = routes[0];
        const inputToken = route.tradeType == sdk_core_1.TradeType.EXACT_INPUT
            ? route.amount.currency
            : route.quote.currency;
        const outputToken = route.tradeType == sdk_core_1.TradeType.EXACT_INPUT
            ? route.quote.currency
            : route.amount.currency;
        // build trade for swap calldata
        const trade = (0, methodParameters_1.buildTrade)(inputToken, outputToken, route.tradeType, routes);
        const data = (0, methodParameters_1.buildSwapMethodParameters)(trade, swapConfig).calldata;
        // calculates gas amounts based on bytes of calldata, use 0 as overhead.
        const l1GasUsed = this.getL2ToL1GasUsed(data, bignumber_1.BigNumber.from(0));
        // multiply by the fee per calldata and add the flat l2 fee
        let l1Fee = l1GasUsed.mul(perL1CalldataFee);
        l1Fee = l1Fee.add(perL2TxFee);
        return [l1GasUsed, l1Fee];
    }
    // based on the code from the optimism OVM_GasPriceOracle contract
    getL2ToL1GasUsed(data, overhead) {
        // data is hex encoded
        const dataArr = data.slice(2).match(/.{1,2}/g);
        const numBytes = dataArr.length;
        let count = 0;
        for (let i = 0; i < numBytes; i += 1) {
            const byte = parseInt(dataArr[i], 16);
            if (byte == 0) {
                count += 4;
            }
            else {
                count += 16;
            }
        }
        const unsigned = overhead.add(count);
        const signedConversion = 68 * 16;
        return unsigned.add(signedConversion);
    }
}
exports.V3HeuristicGasModelFactory = V3HeuristicGasModelFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidjMtaGV1cmlzdGljLWdhcy1tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9yb3V0ZXJzL2FscGhhLXJvdXRlci9nYXMtbW9kZWxzL3YzL3YzLWhldXJpc3RpYy1nYXMtbW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsd0RBQXFEO0FBQ3JELGdEQUE4RDtBQUM5RCw0Q0FBa0Q7QUFDbEQsb0RBQXVCO0FBQ3ZCLG1DQUFtRTtBQU9uRSwyQ0FBMkM7QUFDM0Msc0RBQTBEO0FBQzFELDhDQUEyQztBQUMzQyx3RUFHMkM7QUFFM0MsNENBSXNCO0FBQ3RCLDJDQUErRTtBQUUvRSwyQ0FBMkM7QUFDM0MsTUFBTSxvQkFBb0IsR0FBRyxxQkFBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUUvQzs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FpQkc7QUFDSCxNQUFhLDBCQUEyQixTQUFRLDhCQUFrQjtJQUNoRTtRQUNFLEtBQUssRUFBRSxDQUFDO0lBQ1YsQ0FBQztJQUVNLEtBQUssQ0FBQyxhQUFhLENBQ3hCLE9BQWdCLEVBQ2hCLFdBQXNCLEVBQ3RCLFlBQTZCLEVBQzdCLEtBQVksRUFDWixpQkFFdUM7SUFDdkMseUJBQXlCOztRQUV6QixNQUFNLFNBQVMsR0FBRyxpQkFBaUI7WUFDakMsQ0FBQyxDQUFDLE1BQU0saUJBQWlCLENBQUMsVUFBVSxFQUFFO1lBQ3RDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFFZCxNQUFNLE9BQU8sR0FBUyxNQUFNLElBQUksQ0FBQywwQkFBMEIsQ0FDekQsT0FBTyxFQUNQLFlBQVksQ0FDYixDQUFDO1FBRUYsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQzlCLEtBQThCLEVBSzdCLEVBQUU7WUFDSCxNQUFNLFdBQVcsR0FBZ0I7Z0JBQy9CLFNBQVMsRUFBRSw0Q0FBNEM7Z0JBQ3ZELFFBQVEsRUFBRSxHQUFHO2dCQUNiLGlCQUFpQixFQUFFLElBQUks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