import { Token } from '@uniswap/sdk-core';
import { ChainId } from './chains';
export declare const V3_CORE_FACTORY_ADDRESS = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export declare const QUOTER_V2_ADDRESS = "0x61fFE014bA17989E743c5F6cB21bF9697530B21e";
export declare const OVM_GASPRICE_ADDRESS = "0x420000000000000000000000000000000000000F";
export declare const ARB_GASINFO_ADDRESS = "0x000000000000000000000000000000000000006C";
export declare const TICK_LENS_ADDRESS = "0xbfd8137f7d1516D3ea5cA83523914859ec47F573";
export declare const NONFUNGIBLE_POSITION_MANAGER_ADDRESS = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
export declare const SWAP_ROUTER_ADDRESS = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export declare const V3_MIGRATOR_ADDRESS = "0xA5644E29708357803b5A882D272c41cC0dF92B34";
export declare const UNISWAP_MULTICALL_ADDRESS = "0x1F98415757620B543A52E61c46B32eB19261F984";
export declare const MULTICALL2_ADDRESS = "0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696";
export declare const BSCTESTNET_MULTICALL_ADDRESS = "0x4445286592CaADEB59917f16826B964C3e7B2D36";
export declare const BSC_MULTICALL_ADDRESS = "0xac1cE734566f390A94b00eb9bf561c2625BF44ea";
export declare const POLYGON_MULTICALL_ADDRESS = "0x1F98415757620B543A52E61c46B32eB19261F984";
export declare const GNOSIS_MULTICALL_ADDRESS = "0xe56A6B2Ed6fA3c7c3b9a4A2cE0A51d5dd0f5b8E5";
export declare const WETH9: {
    [chainId in Exclude<ChainId, ChainId.GNOSIS | ChainId.POLYGON | ChainId.POLYGON_MUMBAI>]: Token;
};
