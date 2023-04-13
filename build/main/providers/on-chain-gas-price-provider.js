"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnChainGasPriceProvider = void 0;
const chains_1 = require("../util/chains");
const gas_price_provider_1 = require("./gas-price-provider");
const DEFAULT_EIP_1559_SUPPORTED_CHAINS = [
    chains_1.ChainId.MAINNET,
    chains_1.ChainId.RINKEBY,
    chains_1.ChainId.ROPSTEN,
    chains_1.ChainId.GÖRLI,
    chains_1.ChainId.BSCTESTNET,
    chains_1.ChainId.GNOSIS,
    chains_1.ChainId.POLYGON_MUMBAI,
    // infura endpoint having difficulty w/ eip-1559 on kovan
    // ChainId.KOVAN,
];
/**
 * Gets gas prices on chain. If the chain supports EIP-1559 and has the feeHistory API,
 * uses the EIP1559 provider. Otherwise it will use a legacy provider that uses eth_gasPrice
 *
 * @export
 * @class OnChainGasPriceProvider
 */
class OnChainGasPriceProvider extends gas_price_provider_1.IGasPriceProvider {
    constructor(chainId, eip1559GasPriceProvider, legacyGasPriceProvider, eipChains = DEFAULT_EIP_1559_SUPPORTED_CHAINS) {
        super();
        this.chainId = chainId;
        this.eip1559GasPriceProvider = eip1559GasPriceProvider;
        this.legacyGasPriceProvider = legacyGasPriceProvider;
        this.eipChains = eipChains;
    }
    async getGasPrice() {
        if (this.eipChains.includes(this.chainId)) {
            return this.eip1559GasPriceProvider.getGasPrice();
        }
        return this.legacyGasPriceProvider.getGasPrice();
    }
}
exports.OnChainGasPriceProvider = OnChainGasPriceProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib24tY2hhaW4tZ2FzLXByaWNlLXByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9vbi1jaGFpbi1nYXMtcHJpY2UtcHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXlDO0FBRXpDLDZEQUFtRTtBQUduRSxNQUFNLGlDQUFpQyxHQUFHO0lBQ3hDLGdCQUFPLENBQUMsT0FBTztJQUNmLGdCQUFPLENBQUMsT0FBTztJQUNmLGdCQUFPLENBQUMsT0FBTztJQUNmLGdCQUFPLENBQUMsS0FBSztJQUNiLGdCQUFPLENBQUMsVUFBVTtJQUNsQixnQkFBTyxDQUFDLE1BQU07SUFDZCxnQkFBTyxDQUFDLGNBQWM7SUFDdEIseURBQXlEO0lBQ3pELGlCQUFpQjtDQUNsQixDQUFDO0FBRUY7Ozs7OztHQU1HO0FBQ0gsTUFBYSx1QkFBd0IsU0FBUSxzQ0FBaUI7SUFDNUQsWUFDWSxPQUFnQixFQUNoQix1QkFBZ0QsRUFDaEQsc0JBQThDLEVBQzlDLFlBQXVCLGlDQUFpQztRQUVsRSxLQUFLLEVBQUUsQ0FBQztRQUxFLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFDaEIsNEJBQXVCLEdBQXZCLHVCQUF1QixDQUF5QjtRQUNoRCwyQkFBc0IsR0FBdEIsc0JBQXNCLENBQXdCO1FBQzlDLGNBQVMsR0FBVCxTQUFTLENBQStDO0lBR3BFLENBQUM7SUFFTSxLQUFLLENBQUMsV0FBVztRQUN0QixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUN6QyxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUNuRDtRQUVELE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ25ELENBQUM7Q0FDRjtBQWpCRCwwREFpQkMifQ==