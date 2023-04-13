"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniswapMulticallProvider = void 0;
const lodash_1 = __importDefault(require("lodash"));
const stats_lite_1 = __importDefault(require("stats-lite"));
const UniswapInterfaceMulticall__factory_1 = require("../types/v3/factories/UniswapInterfaceMulticall__factory");
const util_1 = require("../util");
const addresses_1 = require("../util/addresses");
const log_1 = require("../util/log");
const multicall_provider_1 = require("./multicall-provider");
const contractAddressByChain = {
    [util_1.ChainId.MAINNET]: addresses_1.UNISWAP_MULTICALL_ADDRESS,
    [util_1.ChainId.RINKEBY]: addresses_1.UNISWAP_MULTICALL_ADDRESS,
    [util_1.ChainId.KOVAN]: addresses_1.UNISWAP_MULTICALL_ADDRESS,
    [util_1.ChainId.ROPSTEN]: addresses_1.UNISWAP_MULTICALL_ADDRESS,
    [util_1.ChainId.GÖRLI]: addresses_1.UNISWAP_MULTICALL_ADDRESS,
    [util_1.ChainId.BSCTESTNET]: addresses_1.BSCTESTNET_MULTICALL_ADDRESS,
};
/**
 * The UniswapMulticall contract has added functionality for limiting the amount of gas
 * that each call within the multicall can consume. This is useful for operations where
 * a call could consume such a large amount of gas that it causes the node to error out
 * with an out of gas error.
 *
 * @export
 * @class UniswapMulticallProvider
 */
class UniswapMulticallProvider extends multicall_provider_1.IMulticallProvider {
    constructor(chainId, provider, gasLimitPerCall = 1000000, multicallAddressOverride = undefined) {
        super();
        this.chainId = chainId;
        this.provider = provider;
        this.gasLimitPerCall = gasLimitPerCall;
        this.multicallAddressOverride = multicallAddressOverride;
        const multicallAddress = multicallAddressOverride
            ? multicallAddressOverride
            : contractAddressByChain[this.chainId];
        if (!multicallAddress) {
            throw new Error(`No address for Uniswap Multicall Contract on chain id: ${chainId}`);
        }
        this.multicallContract = UniswapInterfaceMulticall__factory_1.UniswapInterfaceMulticall__factory.connect(multicallAddress, this.provider);
    }
    async callSameFunctionOnMultipleContracts(params) {
        var _a;
        const { addresses, contractInterface, functionName, functionParams, providerConfig, } = params;
        const blockNumberOverride = (_a = providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber) !== null && _a !== void 0 ? _a : undefined;
        const fragment = contractInterface.getFunction(functionName);
        const callData = contractInterface.encodeFunctionData(fragment, functionParams);
        const calls = lodash_1.default.map(addresses, (address) => {
            return {
                target: address,
                callData,
                gasLimit: this.gasLimitPerCall,
            };
        });
        log_1.log.debug({ calls }, `About to multicall for ${functionName} across ${addresses.length} addresses`);
        const { blockNumber, returnData: aggregateResults } = await this.multicallContract.callStatic.multicall(calls, {
            blockTag: blockNumberOverride,
        });
        const results = [];
        for (let i = 0; i < aggregateResults.length; i++) {
            const { success, returnData } = aggregateResults[i];
            // Return data "0x" is sometimes returned for invalid calls.
            if (!success || returnData.length <= 2) {
                log_1.log.debug({ result: aggregateResults[i] }, `Invalid result calling ${functionName} on address ${addresses[i]}`);
                results.push({
                    success: false,
                    returnData,
                });
                continue;
            }
            results.push({
                success: true,
                result: contractInterface.decodeFunctionResult(fragment, returnData),
            });
        }
        log_1.log.debug({ results }, `Results for multicall on ${functionName} across ${addresses.length} addresses as of block ${blockNumber}`);
        return { blockNumber, results };
    }
    async callSameFunctionOnContractWithMultipleParams(params) {
        var _a, _b;
        const { address, contractInterface, functionName, functionParams, additionalConfig, providerConfig, } = params;
        const fragment = contractInterface.getFunction(functionName);
        const gasLimitPerCall = (_a = additionalConfig === null || additionalConfig === void 0 ? void 0 : additionalConfig.gasLimitPerCallOverride) !== null && _a !== void 0 ? _a : this.gasLimitPerCall;
        const blockNumberOverride = (_b = providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber) !== null && _b !== void 0 ? _b : undefined;
        const calls = lodash_1.default.map(functionParams, (functionParam) => {
            const callData = contractInterface.encodeFunctionData(fragment, functionParam);
            return {
                target: address,
                callData,
                gasLimit: gasLimitPerCall,
            };
        });
        log_1.log.debug({ calls }, `About to multicall for ${functionName} at address ${address} with ${functionParams.length} different sets of params`);
        const { blockNumber, returnData: aggregateResults } = await this.multicallContract.callStatic.multicall(calls, {
            blockTag: blockNumberOverride,
        });
        const results = [];
        const gasUsedForSuccess = [];
        for (let i = 0; i < aggregateResults.length; i++) {
            const { success, returnData, gasUsed } = aggregateResults[i];
            // Return data "0x" is sometimes returned for invalid pools.
            if (!success || returnData.length <= 2) {
                log_1.log.debug({ result: aggregateResults[i] }, `Invalid result calling ${functionName} with params ${functionParams[i]}`);
                results.push({
                    success: false,
                    returnData,
                });
                continue;
            }
            gasUsedForSuccess.push(gasUsed.toNumber());
            results.push({
                success: true,
                result: contractInterface.decodeFunctionResult(fragment, returnData),
            });
        }
        log_1.log.debug({ results, functionName, address }, `Results for multicall for ${functionName} at address ${address} with ${functionParams.length} different sets of params. Results as of block ${blockNumber}`);
        return {
            blockNumber,
            results,
            approxGasUsedPerSuccessCall: stats_lite_1.default.percentile(gasUsedForSuccess, 99),
        };
    }
    async callMultipleFunctionsOnSameContract(params) {
        var _a, _b;
        const { address, contractInterface, functionNames, functionParams, additionalConfig, providerConfig, } = params;
        const gasLimitPerCall = (_a = additionalConfig === null || additionalConfig === void 0 ? void 0 : additionalConfig.gasLimitPerCallOverride) !== null && _a !== void 0 ? _a : this.gasLimitPerCall;
        const blockNumberOverride = (_b = providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber) !== null && _b !== void 0 ? _b : undefined;
        const calls = lodash_1.default.map(functionNames, (functionName, i) => {
            const fragment = contractInterface.getFunction(functionName);
            const param = functionParams ? functionParams[i] : [];
            const callData = contractInterface.encodeFunctionData(fragment, param);
            return {
                target: address,
                callData,
                gasLimit: gasLimitPerCall,
            };
        });
        log_1.log.debug({ calls }, `About to multicall for ${functionNames.length} functions at address ${address} with ${functionParams === null || functionParams === void 0 ? void 0 : functionParams.length} different sets of params`);
        const { blockNumber, returnData: aggregateResults } = await this.multicallContract.callStatic.multicall(calls, {
            blockTag: blockNumberOverride,
        });
        const results = [];
        const gasUsedForSuccess = [];
        for (let i = 0; i < aggregateResults.length; i++) {
            const fragment = contractInterface.getFunction(functionNames[i]);
            const { success, returnData, gasUsed } = aggregateResults[i];
            // Return data "0x" is sometimes returned for invalid pools.
            if (!success || returnData.length <= 2) {
                log_1.log.debug({ result: aggregateResults[i] }, `Invalid result calling ${functionNames[i]} with ${functionParams ? functionParams[i] : '0'} params`);
                results.push({
                    success: false,
                    returnData,
                });
                continue;
            }
            gasUsedForSuccess.push(gasUsed.toNumber());
            results.push({
                success: true,
                result: contractInterface.decodeFunctionResult(fragment, returnData),
            });
        }
        log_1.log.debug({ results, functionNames, address }, `Results for multicall for ${functionNames.length} functions at address ${address} with ${functionParams ? functionParams.length : ' 0'} different sets of params. Results as of block ${blockNumber}`);
        return {
            blockNumber,
            results,
            approxGasUsedPerSuccessCall: stats_lite_1.default.percentile(gasUsedForSuccess, 99),
        };
    }
}
exports.UniswapMulticallProvider = UniswapMulticallProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGljYWxsLXVuaXN3YXAtcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL211bHRpY2FsbC11bmlzd2FwLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUVBLG9EQUF1QjtBQUN2Qiw0REFBK0I7QUFDL0IsaUhBQThHO0FBRTlHLGtDQUFrQztBQUNsQyxpREFHMkI7QUFDM0IscUNBQWtDO0FBQ2xDLDZEQU04QjtBQU05QixNQUFNLHNCQUFzQixHQUFzQztJQUNoRSxDQUFDLGNBQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxxQ0FBeUI7SUFDNUMsQ0FBQyxjQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUscUNBQXlCO0lBQzVDLENBQUMsY0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLHFDQUF5QjtJQUMxQyxDQUFDLGNBQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxxQ0FBeUI7SUFDNUMsQ0FBQyxjQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUscUNBQXlCO0lBQzFDLENBQUMsY0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLHdDQUE0QjtDQUNuRCxDQUFDO0FBRUY7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFhLHdCQUF5QixTQUFRLHVDQUEwQztJQUd0RixZQUNZLE9BQWdCLEVBQ2hCLFFBQXNCLEVBQ3RCLGtCQUFrQixPQUFTLEVBQzNCLDJCQUErQyxTQUFTO1FBRWxFLEtBQUssRUFBRSxDQUFDO1FBTEUsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNoQixhQUFRLEdBQVIsUUFBUSxDQUFjO1FBQ3RCLG9CQUFlLEdBQWYsZUFBZSxDQUFZO1FBQzNCLDZCQUF3QixHQUF4Qix3QkFBd0IsQ0FBZ0M7UUFHbEUsTUFBTSxnQkFBZ0IsR0FBRyx3QkFBd0I7WUFDL0MsQ0FBQyxDQUFDLHdCQUF3QjtZQUMxQixDQUFDLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRXpD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