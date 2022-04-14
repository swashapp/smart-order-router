import _ from 'lodash';
import stats from 'stats-lite';
import { UniswapInterfaceMulticall__factory } from '../types/v3/factories/UniswapInterfaceMulticall__factory';
import { ChainId } from '../util';
import { UNISWAP_MULTICALL_ADDRESS } from '../util/addresses';
import { log } from '../util/log';
import { IMulticallProvider, } from './multicall-provider';
const contractAddressByChain = {
    [ChainId.MAINNET]: UNISWAP_MULTICALL_ADDRESS,
    [ChainId.RINKEBY]: UNISWAP_MULTICALL_ADDRESS,
    [ChainId.KOVAN]: UNISWAP_MULTICALL_ADDRESS,
    [ChainId.ROPSTEN]: UNISWAP_MULTICALL_ADDRESS,
    [ChainId.GÖRLI]: UNISWAP_MULTICALL_ADDRESS,
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
export class UniswapMulticallProvider extends IMulticallProvider {
    constructor(chainId, provider, gasLimitPerCall = 1000000, multicallAddressOverride = UNISWAP_MULTICALL_ADDRESS) {
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
        this.multicallContract = UniswapInterfaceMulticall__factory.connect(multicallAddress, this.provider);
    }
    async callSameFunctionOnMultipleContracts(params) {
        var _a;
        const { addresses, contractInterface, functionName, functionParams, providerConfig, } = params;
        const blockNumberOverride = (_a = providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber) !== null && _a !== void 0 ? _a : undefined;
        const fragment = contractInterface.getFunction(functionName);
        const callData = contractInterface.encodeFunctionData(fragment, functionParams);
        const calls = _.map(addresses, (address) => {
            return {
                target: address,
                callData,
                gasLimit: this.gasLimitPerCall,
            };
        });
        log.debug({ calls }, `About to multicall for ${functionName} across ${addresses.length} addresses`);
        const { blockNumber, returnData: aggregateResults } = await this.multicallContract.callStatic.multicall(calls, {
            blockTag: blockNumberOverride,
        });
        const results = [];
        for (let i = 0; i < aggregateResults.length; i++) {
            const { success, returnData } = aggregateResults[i];
            // Return data "0x" is sometimes returned for invalid calls.
            if (!success || returnData.length <= 2) {
                log.debug({ result: aggregateResults[i] }, `Invalid result calling ${functionName} on address ${addresses[i]}`);
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
        log.debug({ results }, `Results for multicall on ${functionName} across ${addresses.length} addresses as of block ${blockNumber}`);
        return { blockNumber, results };
    }
    async callSameFunctionOnContractWithMultipleParams(params) {
        var _a, _b;
        const { address, contractInterface, functionName, functionParams, additionalConfig, providerConfig, } = params;
        const fragment = contractInterface.getFunction(functionName);
        const gasLimitPerCall = (_a = additionalConfig === null || additionalConfig === void 0 ? void 0 : additionalConfig.gasLimitPerCallOverride) !== null && _a !== void 0 ? _a : this.gasLimitPerCall;
        const blockNumberOverride = (_b = providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber) !== null && _b !== void 0 ? _b : undefined;
        const calls = _.map(functionParams, (functionParam) => {
            const callData = contractInterface.encodeFunctionData(fragment, functionParam);
            return {
                target: address,
                callData,
                gasLimit: gasLimitPerCall,
            };
        });
        log.debug({ calls }, `About to multicall for ${functionName} at address ${address} with ${functionParams.length} different sets of params`);
        const { blockNumber, returnData: aggregateResults } = await this.multicallContract.callStatic.multicall(calls, {
            blockTag: blockNumberOverride,
        });
        const results = [];
        const gasUsedForSuccess = [];
        for (let i = 0; i < aggregateResults.length; i++) {
            const { success, returnData, gasUsed } = aggregateResults[i];
            // Return data "0x" is sometimes returned for invalid pools.
            if (!success || returnData.length <= 2) {
                log.debug({ result: aggregateResults[i] }, `Invalid result calling ${functionName} with params ${functionParams[i]}`);
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
        log.debug({ results, functionName, address }, `Results for multicall for ${functionName} at address ${address} with ${functionParams.length} different sets of params. Results as of block ${blockNumber}`);
        return {
            blockNumber,
            results,
            approxGasUsedPerSuccessCall: stats.percentile(gasUsedForSuccess, 99),
        };
    }
    async callMultipleFunctionsOnSameContract(params) {
        var _a, _b;
        const { address, contractInterface, functionNames, functionParams, additionalConfig, providerConfig, } = params;
        const gasLimitPerCall = (_a = additionalConfig === null || additionalConfig === void 0 ? void 0 : additionalConfig.gasLimitPerCallOverride) !== null && _a !== void 0 ? _a : this.gasLimitPerCall;
        const blockNumberOverride = (_b = providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber) !== null && _b !== void 0 ? _b : undefined;
        const calls = _.map(functionNames, (functionName, i) => {
            const fragment = contractInterface.getFunction(functionName);
            const param = functionParams ? functionParams[i] : [];
            const callData = contractInterface.encodeFunctionData(fragment, param);
            return {
                target: address,
                callData,
                gasLimit: gasLimitPerCall,
            };
        });
        log.debug({ calls }, `About to multicall for ${functionNames.length} functions at address ${address} with ${functionParams === null || functionParams === void 0 ? void 0 : functionParams.length} different sets of params`);
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
                log.debug({ result: aggregateResults[i] }, `Invalid result calling ${functionNames[i]} with ${functionParams ? functionParams[i] : '0'} params`);
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
        log.debug({ results, functionNames, address }, `Results for multicall for ${functionNames.length} functions at address ${address} with ${functionParams ? functionParams.length : ' 0'} different sets of params. Results as of block ${blockNumber}`);
        return {
            blockNumber,
            results,
            approxGasUsedPerSuccessCall: stats.percentile(gasUsedForSuccess, 99),
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGljYWxsLXVuaXN3YXAtcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL211bHRpY2FsbC11bmlzd2FwLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQUN2QixPQUFPLEtBQUssTUFBTSxZQUFZLENBQUM7QUFDL0IsT0FBTyxFQUFFLGtDQUFrQyxFQUFFLE1BQU0sMERBQTBELENBQUM7QUFFOUcsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUNsQyxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ2xDLE9BQU8sRUFJTCxrQkFBa0IsR0FFbkIsTUFBTSxzQkFBc0IsQ0FBQztBQU05QixNQUFNLHNCQUFzQixHQUFzQztJQUNoRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSx5QkFBeUI7SUFDNUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUseUJBQXlCO0lBQzVDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLHlCQUF5QjtJQUMxQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSx5QkFBeUI7SUFDNUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUseUJBQXlCO0NBQzNDLENBQUM7QUFFRjs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxrQkFBMEM7SUFHdEYsWUFDWSxPQUFnQixFQUNoQixRQUFzQixFQUN0QixrQkFBa0IsT0FBUyxFQUMzQiwyQkFBMkIseUJBQXlCO1FBRTlELEtBQUssRUFBRSxDQUFDO1FBTEUsWUFBTyxHQUFQLE9BQU8sQ0FBUztRQUNoQixhQUFRLEdBQVIsUUFBUSxDQUFjO1FBQ3RCLG9CQUFlLEdBQWYsZUFBZSxD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