import { Ether, NativeCurrency, Token } from '@uniswap/sdk-core';
export var ChainId;
(function (ChainId) {
    ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
    ChainId[ChainId["ROPSTEN"] = 3] = "ROPSTEN";
    ChainId[ChainId["RINKEBY"] = 4] = "RINKEBY";
    ChainId[ChainId["G\u00D6RLI"] = 5] = "G\u00D6RLI";
    ChainId[ChainId["KOVAN"] = 42] = "KOVAN";
    ChainId[ChainId["OPTIMISM"] = 10] = "OPTIMISM";
    ChainId[ChainId["OPTIMISTIC_KOVAN"] = 69] = "OPTIMISTIC_KOVAN";
    ChainId[ChainId["ARBITRUM_ONE"] = 42161] = "ARBITRUM_ONE";
    ChainId[ChainId["ARBITRUM_RINKEBY"] = 421611] = "ARBITRUM_RINKEBY";
    ChainId[ChainId["GNOSIS"] = 100] = "GNOSIS";
    ChainId[ChainId["POLYGON"] = 137] = "POLYGON";
    ChainId[ChainId["POLYGON_MUMBAI"] = 80001] = "POLYGON_MUMBAI";
})(ChainId || (ChainId = {}));
export const V2_SUPPORTED = [
    ChainId.MAINNET,
    ChainId.KOVAN,
    ChainId.GÖRLI,
    ChainId.RINKEBY,
    ChainId.ROPSTEN,
    ChainId.GNOSIS,
];
export const HAS_L1_FEE = [
    ChainId.OPTIMISM,
    ChainId.OPTIMISTIC_KOVAN,
    ChainId.ARBITRUM_ONE,
    ChainId.ARBITRUM_RINKEBY,
];
export const ID_TO_CHAIN_ID = (id) => {
    switch (id) {
        case 1:
            return ChainId.MAINNET;
        case 3:
            return ChainId.ROPSTEN;
        case 4:
            return ChainId.RINKEBY;
        case 5:
            return ChainId.GÖRLI;
        case 42:
            return ChainId.KOVAN;
        case 10:
            return ChainId.OPTIMISM;
        case 69:
            return ChainId.OPTIMISTIC_KOVAN;
        case 42161:
            return ChainId.ARBITRUM_ONE;
        case 421611:
            return ChainId.ARBITRUM_RINKEBY;
        case 100:
            return ChainId.GNOSIS;
        case 137:
            return ChainId.POLYGON;
        case 80001:
            return ChainId.POLYGON_MUMBAI;
        default:
            throw new Error(`Unknown chain id: ${id}`);
    }
};
export var ChainName;
(function (ChainName) {
    // ChainNames match infura network strings
    ChainName["MAINNET"] = "mainnet";
    ChainName["ROPSTEN"] = "ropsten";
    ChainName["RINKEBY"] = "rinkeby";
    ChainName["G\u00D6RLI"] = "goerli";
    ChainName["KOVAN"] = "kovan";
    ChainName["OPTIMISM"] = "optimism-mainnet";
    ChainName["OPTIMISTIC_KOVAN"] = "optimism-kovan";
    ChainName["ARBITRUM_ONE"] = "arbitrum-mainnet";
    ChainName["ARBITRUM_RINKEBY"] = "arbitrum-rinkeby";
    ChainName["GNOSIS"] = "gnosis-mainnet";
    ChainName["POLYGON"] = "polygon-mainnet";
    ChainName["POLYGON_MUMBAI"] = "polygon-mumbai";
})(ChainName || (ChainName = {}));
export var NativeCurrencyName;
(function (NativeCurrencyName) {
    // Strings match input for CLI
    NativeCurrencyName["ETHER"] = "ETH";
    NativeCurrencyName["MATIC"] = "MATIC";
    NativeCurrencyName["XDAI"] = "XDAI";
})(NativeCurrencyName || (NativeCurrencyName = {}));
export const NATIVE_CURRENCY = {
    [ChainId.MAINNET]: NativeCurrencyName.ETHER,
    [ChainId.ROPSTEN]: NativeCurrencyName.ETHER,
    [ChainId.RINKEBY]: NativeCurrencyName.ETHER,
    [ChainId.GÖRLI]: NativeCurrencyName.ETHER,
    [ChainId.KOVAN]: NativeCurrencyName.ETHER,
    [ChainId.OPTIMISM]: NativeCurrencyName.ETHER,
    [ChainId.OPTIMISTIC_KOVAN]: NativeCurrencyName.ETHER,
    [ChainId.ARBITRUM_ONE]: NativeCurrencyName.ETHER,
    [ChainId.ARBITRUM_RINKEBY]: NativeCurrencyName.ETHER,
    [ChainId.GNOSIS]: NativeCurrencyName.XDAI,
    [ChainId.POLYGON]: NativeCurrencyName.MATIC,
    [ChainId.POLYGON_MUMBAI]: NativeCurrencyName.MATIC,
};
export const ID_TO_NETWORK_NAME = (id) => {
    switch (id) {
        case 1:
            return ChainName.MAINNET;
        case 3:
            return ChainName.ROPSTEN;
        case 4:
            return ChainName.RINKEBY;
        case 5:
            return ChainName.GÖRLI;
        case 42:
            return ChainName.KOVAN;
        case 10:
            return ChainName.OPTIMISM;
        case 69:
            return ChainName.OPTIMISTIC_KOVAN;
        case 42161:
            return ChainName.ARBITRUM_ONE;
        case 421611:
            return ChainName.ARBITRUM_RINKEBY;
        case 100:
            return ChainName.GNOSIS;
        case 137:
            return ChainName.POLYGON;
        case 80001:
            return ChainName.POLYGON_MUMBAI;
        default:
            throw new Error(`Unknown chain id: ${id}`);
    }
};
export const CHAIN_IDS_LIST = Object.values(ChainId).map((c) => c.toString());
export const ID_TO_PROVIDER = (id) => {
    switch (id) {
        case ChainId.MAINNET:
            return process.env.JSON_RPC_PROVIDER;
        case ChainId.ROPSTEN:
            return process.env.JSON_RPC_PROVIDER_ROPSTEN;
        case ChainId.RINKEBY:
            return process.env.JSON_RPC_PROVIDER_RINKEBY;
        case ChainId.GÖRLI:
            return process.env.JSON_RPC_PROVIDER_GÖRLI;
        case ChainId.KOVAN:
            return process.env.JSON_RPC_PROVIDER_KOVAN;
        case ChainId.OPTIMISM:
            return process.env.JSON_RPC_PROVIDER_OPTIMISM;
        case ChainId.OPTIMISTIC_KOVAN:
            return process.env.JSON_RPC_PROVIDER_OPTIMISTIC_KOVAN;
        case ChainId.ARBITRUM_ONE:
            return process.env.JSON_RPC_PROVIDER_ARBITRUM_ONE;
        case ChainId.ARBITRUM_RINKEBY:
            return process.env.JSON_RPC_PROVIDER_ARBITRUM_RINKEBY;
        case ChainId.GNOSIS:
            return process.env.JSON_RPC_PROVIDER_GNOSIS;
        case ChainId.POLYGON:
            return process.env.JSON_RPC_PROVIDER_POLYGON;
        case ChainId.POLYGON_MUMBAI:
            return process.env.JSON_RPC_PROVIDER_POLYGON_MUMBAI;
        default:
            throw new Error(`Chain id: ${id} not supported`);
    }
};
export const WRAPPED_NATIVE_CURRENCY = {
    [ChainId.MAINNET]: new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.ROPSTEN]: new Token(3, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.RINKEBY]: new Token(4, '0xc778417E063141139Fce010982780140Aa0cD5Ab', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.GÖRLI]: new Token(5, '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.KOVAN]: new Token(42, '0xd0A1E359811322d97991E03f863a0C30C2cF029C', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.OPTIMISM]: new Token(ChainId.OPTIMISM, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.OPTIMISTIC_KOVAN]: new Token(ChainId.OPTIMISTIC_KOVAN, '0x4200000000000000000000000000000000000006', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.ARBITRUM_ONE]: new Token(ChainId.ARBITRUM_ONE, '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.ARBITRUM_RINKEBY]: new Token(ChainId.ARBITRUM_RINKEBY, '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681', 18, 'WETH', 'Wrapped Ether'),
    [ChainId.GNOSIS]: new Token(ChainId.GNOSIS, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'Wrapped XDAI'),
    [ChainId.POLYGON]: new Token(ChainId.POLYGON, '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 18, 'WMATIC', 'Wrapped MATIC'),
    [ChainId.POLYGON_MUMBAI]: new Token(ChainId.POLYGON_MUMBAI, '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', 18, 'WMATIC', 'Wrapped MATIC'),
};
function isGnosis(chainId) {
    return chainId === ChainId.GNOSIS;
}
function isMatic(chainId) {
    return chainId === ChainId.POLYGON_MUMBAI || chainId === ChainId.POLYGON;
}
class GnosisNativeCurrency extends NativeCurrency {
    equals(other) {
        return other.isNative && other.chainId === this.chainId;
    }
    get wrapped() {
        if (!isGnosis(this.chainId))
            throw new Error('Not gnosis');
        const nativeCurrency = WRAPPED_NATIVE_CURRENCY[this.chainId];
        if (nativeCurrency) {
            return nativeCurrency;
        }
        throw new Error(`Does not support this chain ${this.chainId}`);
    }
    constructor(chainId) {
        if (!isGnosis(chainId))
            throw new Error('Not gnosis');
        super(chainId, 18, 'XDAI', 'Gnosis XDAI');
    }
}
class MaticNativeCurrency extends NativeCurrency {
    equals(other) {
        return other.isNative && other.chainId === this.chainId;
    }
    get wrapped() {
        if (!isMatic(this.chainId))
            throw new Error('Not matic');
        const nativeCurrency = WRAPPED_NATIVE_CURRENCY[this.chainId];
        if (nativeCurrency) {
            return nativeCurrency;
        }
        throw new Error(`Does not support this chain ${this.chainId}`);
    }
    constructor(chainId) {
        if (!isMatic(chainId))
            throw new Error('Not matic');
        super(chainId, 18, 'MATIC', 'Polygon Matic');
    }
}
export class ExtendedEther extends Ether {
    get wrapped() {
        if (this.chainId in WRAPPED_NATIVE_CURRENCY)
            return WRAPPED_NATIVE_CURRENCY[this.chainId];
        throw new Error('Unsupported chain ID');
    }
    static onChain(chainId) {
        var _a;
        return ((_a = this._cachedExtendedEther[chainId]) !== null && _a !== void 0 ? _a : (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId)));
    }
}
ExtendedEther._cachedExtendedEther = {};
function getNativeToken(chainId) {
    if (isGnosis(chainId))
        return new GnosisNativeCurrency(chainId);
    else if (isMatic(chainId))
        return new MaticNativeCurrency(chainId);
    else
        return ExtendedEther.onChain(chainId);
}
const cachedNativeCurrency = {};
export function nativeOnChain(chainId) {
    var _a;
    return ((_a = cachedNativeCurrency[chainId]) !== null && _a !== void 0 ? _a : (cachedNativeCurrency[chainId] = getNativeToken(chainId)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWwvY2hhaW5zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBWSxLQUFLLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzNFLE1BQU0sQ0FBTixJQUFZLE9BYVg7QUFiRCxXQUFZLE9BQU87SUFDakIsMkNBQVcsQ0FBQTtJQUNYLDJDQUFXLENBQUE7SUFDWCwyQ0FBVyxDQUFBO0lBQ1gsaURBQVMsQ0FBQTtJQUNULHdDQUFVLENBQUE7SUFDViw4Q0FBYSxDQUFBO0lBQ2IsOERBQXFCLENBQUE7SUFDckIseURBQW9CLENBQUE7SUFDcEIsa0VBQXlCLENBQUE7SUFDekIsMkNBQVksQ0FBQTtJQUNaLDZDQUFhLENBQUE7SUFDYiw2REFBc0IsQ0FBQTtBQUN4QixDQUFDLEVBYlcsT0FBTyxLQUFQLE9BQU8sUUFhbEI7QUFFRCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUc7SUFDMUIsT0FBTyxDQUFDLE9BQU87SUFDZixPQUFPLENBQUMsS0FBSztJQUNiLE9BQU8sQ0FBQyxLQUFLO0lBQ2IsT0FBTyxDQUFDLE9BQU87SUFDZixPQUFPLENBQUMsT0FBTztJQUNmLE9BQU8sQ0FBQyxNQUFNO0NBQ2YsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRztJQUN4QixPQUFPLENBQUMsUUFBUTtJQUNoQixPQUFPLENBQUMsZ0JBQWdCO0lBQ3hCLE9BQU8sQ0FBQyxZQUFZO0lBQ3BCLE9BQU8sQ0FBQyxnQkFBZ0I7Q0FDekIsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxDQUFDLEVBQVUsRUFBVyxFQUFFO0lBQ3BELFFBQVEsRUFBRSxFQUFFO1FBQ1YsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ3pCLEtBQUssQ0FBQztZQUNKLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUN6QixLQUFLLENBQUM7WUFDSixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDekIsS0FBSyxDQUFDO1lBQ0osT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLEtBQUssRUFBRTtZQUNMLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQztRQUN2QixLQUFLLEVBQUU7WUFDTCxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUM7UUFDMUIsS0FBSyxFQUFFO1lBQ0wsT0FBTyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7UUFDbEMsS0FBSyxLQUFLO1lBQ1IsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDO1FBQzlCLEtBQUssTUFBTTtZQUNULE9BQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDO1FBQ2xDLEtBQUssR0FBRztZQUNOLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUN4QixLQUFLLEdBQUc7WUFDTixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDekIsS0FBSyxLQUFLO1lBQ1IsT0FBTyxPQUFPLENBQUMsY0FBYyxDQUFDO1FBQ2hDO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUM5QztBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBTixJQUFZLFNBY1g7QUFkRCxXQUFZLFNBQVM7SUFDbkIsMENBQTBDO0lBQzFDLGdDQUFtQixDQUFBO0lBQ25CLGdDQUFtQixDQUFBO0lBQ25CLGdDQUFtQixDQUFBO0lBQ25CLGtDQUFnQixDQUFBO0lBQ2hCLDRCQUFlLENBQUE7SUFDZiwwQ0FBNkIsQ0FBQTtJQUM3QixnREFBbUMsQ0FBQTtJQUNuQyw4Q0FBaUMsQ0FBQTtJQUNqQyxrREFBcUMsQ0FBQTtJQUNyQyxzQ0FBeUIsQ0FBQTtJQUN6Qix3Q0FBMkIsQ0FBQTtJQUMzQiw4Q0FBaUMsQ0FBQTtBQUNuQyxDQUFDLEVBZFcsU0FBUyxLQUFULFNBQVMsUUFjcEI7QUFFRCxNQUFNLENBQU4sSUFBWSxrQkFLWDtBQUxELFdBQVksa0JBQWtCO0lBQzVCLDhCQUE4QjtJQUM5QixtQ0FBYSxDQUFBO0lBQ2IscUNBQWUsQ0FBQTtJQUNmLG1DQUFhLENBQUE7QUFDZixDQUFDLEVBTFcsa0JBQWtCLEtBQWxCLGtCQUFrQixRQUs3QjtBQUVELE1BQU0sQ0FBQyxNQUFNLGVBQWUsR0FBOEM7SUFDeEUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsS0FBSztJQUMzQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLO0lBQzNDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUs7SUFDM0MsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsS0FBSztJQUN6QyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLO0lBQ3pDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUs7SUFDNUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLO0lBQ3BELENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLGtCQUFrQixDQUFDLEtBQUs7SUFDaEQsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLO0lBQ3BELENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLGtCQUFrQixDQUFDLElBQUk7SUFDekMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsS0FBSztJQUMzQyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLO0NBQ25ELENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLEVBQVUsRUFBYSxFQUFFO0lBQzFELFFBQVEsRUFBRSxFQUFFO1FBQ1YsS0FBSyxDQUFDO1lBQ0osT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDO1FBQzNCLEtBQUssQ0FBQztZQUNKLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQztRQUMzQixLQUFLLENBQUM7WUFDSixPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDM0IsS0FBSyxDQUFDO1lBQ0osT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3pCLEtBQUssRUFBRTtZQUNMLE9BQU8sU0FBUyxDQUFDLEtBQUssQ0FBQztRQUN6QixLQUFLLEVBQUU7WUFDTCxPQUFPLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDNUIsS0FBSyxFQUFFO1lBQ0wsT0FBTyxTQUFTLENBQUMsZ0JBQWdCLENBQUM7UUFDcEMsS0FBSyxLQUFLO1lBQ1IsT0FBTyxTQUFTLENBQUMsWUFBWSxDQUFDO1FBQ2hDLEtBQUssTUFBTTtZQUNULE9BQU8sU0FBUyxDQUFDLGdCQUFnQixDQUFDO1FBQ3BDLEtBQUssR0FBRztZQUNOLE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUMxQixLQUFLLEdBQUc7WUFDTixPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDM0IsS0FBSyxLQUFLO1lBQ1IsT0FBTyxTQUFTLENBQUMsY0FBYyxDQUFDO1FBQ2xDO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUM5QztBQUNILENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQzdELENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FDRCxDQUFDO0FBRWQsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLENBQUMsRUFBVyxFQUFVLEVBQUU7SUFDcEQsUUFBUSxFQUFFLEVBQUU7UUFDVixLQUFLLE9BQU8sQ0FBQyxPQUFPO1lBQ2xCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBa0IsQ0FBQztRQUN4QyxLQUFLLE9BQU8sQ0FBQyxPQUFPO1lBQ2xCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBMEIsQ0FBQztRQUNoRCxLQUFLLE9BQU8sQ0FBQyxPQUFPO1lBQ2xCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBMEIsQ0FBQztRQUNoRCxLQUFLLE9BQU8sQ0FBQyxLQUFLO1lBQ2hCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBd0IsQ0FBQztRQUM5QyxLQUFLLE9BQU8sQ0FBQyxLQUFLO1lBQ2hCLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyx1QkFBd0IsQ0FBQztRQUM5QyxLQUFLLE9BQU8sQ0FBQyxRQUFRO1lBQ25CLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQywwQkFBMkIsQ0FBQztRQUNqRCxLQUFLLE9BQU8sQ0FBQyxnQkFBZ0I7WUFDM0IsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFtQyxDQUFDO1FBQ3pELEtBQUssT0FBTyxDQUFDLFlBQVk7WUFDdkIsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLDhCQUErQixDQUFDO1FBQ3JELEtBQUssT0FBTyxDQUFDLGdCQUFnQjtZQUMzQixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQW1DLENBQUM7UUFDekQsS0FBSyxPQUFPLENBQUMsTUFBTTtZQUNqQixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsd0JBQXlCLENBQUM7UUFDL0MsS0FBSyxPQUFPLENBQUMsT0FBTztZQUNsQixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQTBCLENBQUM7UUFDaEQsS0FBSyxPQUFPLENBQUMsY0FBYztZQUN6QixPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0NBQWlDLENBQUM7UUFDdkQ7WUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ3BEO0FBQ0gsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sdUJBQXVCLEdBQW9DO0lBQ3RFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksS0FBSyxDQUMxQixDQUFDLEVBQ0QsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixNQUFNLEVBQ04sZUFBZSxDQUNoQjtJQUNELENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksS0FBSyxDQUMxQixDQUFDLEVBQ0QsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixNQUFNLEVBQ04sZUFBZSxDQUNoQjtJQUNELENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLElBQUksS0FBSyxDQUMxQixDQUFDLEVBQ0QsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixNQUFNLEVBQ04sZUFBZSxDQUNoQjtJQUNELENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUN4QixDQUFDLEVBQ0QsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixNQUFNLEVBQ04sZUFBZSxDQUNoQjtJQUNELENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLElBQUksS0FBSyxDQUN4QixFQUFFLEVBQ0YsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixNQUFNLEVBQ04sZUFBZSxDQUNoQjtJQUNELENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUMzQixPQUFPLENBQUMsUUFBUSxFQUNoQiw0Q0FBNEMsRUFDNUMsRUFBRSxFQUNGLE1BQU0sRUFDTixlQUFlLENBQ2hCO0lBQ0QsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FDbkMsT0FBTyxDQUFDLGdCQUFnQixFQUN4Qiw0Q0FBNEMsRUFDNUMsRUFBRSxFQUNGLE1BQU0sRUFDTixlQUFlLENBQ2hCO0lBQ0QsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQy9CLE9BQU8sQ0FBQyxZQUFZLEVBQ3BCLDRDQUE0QyxFQUM1QyxFQUFFLEVBQ0YsTUFBTSxFQUNOLGVBQWUsQ0FDaEI7SUFDRCxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksS0FBSyxDQUNuQyxPQUFPLENBQUMsZ0JBQWdCLEVBQ3hCLDRDQUE0QyxFQUM1QyxFQUFFLEVBQ0YsTUFBTSxFQUNOLGVBQWUsQ0FDaEI7SUFDRCxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FDekIsT0FBTyxDQUFDLE1BQU0sRUFDZCw0Q0FBNEMsRUFDNUMsRUFBRSxFQUNGLE9BQU8sRUFDUCxjQUFjLENBQ2Y7SUFDRCxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxJQUFJLEtBQUssQ0FDMUIsT0FBTyxDQUFDLE9BQU8sRUFDZiw0Q0FBNEMsRUFDNUMsRUFBRSxFQUNGLFFBQVEsRUFDUixlQUFlLENBQ2hCO0lBQ0QsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUUsSUFBSSxLQUFLLENBQ2pDLE9BQU8sQ0FBQyxjQUFjLEVBQ3RCLDRDQUE0QyxFQUM1QyxFQUFFLEVBQ0YsUUFBUSxFQUNSLGVBQWUsQ0FDaEI7Q0FDRixDQUFDO0FBRUYsU0FBUyxRQUFRLENBQUMsT0FBZTtJQUMvQixPQUFPLE9BQU8sS0FBSyxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQ3BDLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FDZCxPQUFlO0lBRWYsT0FBTyxPQUFPLEtBQUssT0FBTyxDQUFDLGNBQWMsSUFBSSxPQUFPLEtBQUssT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUMzRSxDQUFDO0FBRUQsTUFBTSxvQkFBcUIsU0FBUSxjQUFjO0lBQy9DLE1BQU0sQ0FBQyxLQUFlO1FBQ3BCLE9BQU8sS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsT0FBTyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDMUQsQ0FBQztJQUVELElBQUksT0FBTztRQUNULElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0QsTUFBTSxjQUFjLEdBQUcsdUJBQXVCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzdELElBQUksY0FBYyxFQUFFO1lBQ2xCLE9BQU8sY0FBYyxDQUFDO1NBQ3ZCO1FBQ0QsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELFlBQW1CLE9BQWU7UUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM1QyxDQUFDO0NBQ0Y7QUFFRCxNQUFNLG1CQUFvQixTQUFRLGNBQWM7SUFDOUMsTUFBTSxDQUFDLEtBQWU7UUFDcEIsT0FBTyxLQUFLLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUMxRCxDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6RCxNQUFNLGNBQWMsR0FBRyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0QsSUFBSSxjQUFjLEVBQUU7WUFDbEIsT0FBTyxjQUFjLENBQUM7U0FDdkI7UUFDRCxNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsWUFBbUIsT0FBZTtRQUNoQyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEQsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0lBQy9DLENBQUM7Q0FDRjtBQUVELE1BQU0sT0FBTyxhQUFjLFNBQVEsS0FBSztJQUN0QyxJQUFXLE9BQU87UUFDaEIsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLHVCQUF1QjtZQUN6QyxPQUFPLHVCQUF1QixDQUFDLElBQUksQ0FBQyxPQUFrQixDQUFDLENBQUM7UUFDMUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFLTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQWU7O1FBQ25DLE9BQU8sQ0FDTCxNQUFBLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsbUNBQ2xDLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQ2xFLENBQUM7SUFDSixDQUFDOztBQVJjLGtDQUFvQixHQUNqQyxFQUFFLENBQUM7QUFVUCxTQUFTLGNBQWMsQ0FBQyxPQUFlO0lBQ3JDLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUFFLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMzRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFBRSxPQUFPLElBQUksbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7O1FBQzlELE9BQU8sYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBRUQsTUFBTSxvQkFBb0IsR0FBMEMsRUFBRSxDQUFDO0FBQ3ZFLE1BQU0sVUFBVSxhQUFhLENBQUMsT0FBZTs7SUFDM0MsT0FBTyxDQUNMLE1BQUEsb0JBQW9CLENBQUMsT0FBTyxDQUFDLG1DQUM3QixDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUMxRCxDQUFDO0FBQ0osQ0FBQyJ9