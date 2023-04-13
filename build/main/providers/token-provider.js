"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USDC_POLYGON = exports.WETH_POLYGON = exports.WMATIC_POLYGON = exports.GNO_GNOSIS = exports.TEC_GNOSIS = exports.GIV_GNOSIS = exports.AGVE_GNOSIS = exports.HONEY_GNOSIS = exports.WBTC_GNOSIS = exports.USDT_GNOSIS = exports.USDC_GNOSIS = exports.WETH_GNOSIS = exports.WXDAI_GNOSIS = exports.UNI_ARBITRUM_RINKEBY = exports.USDC_ARBITRUM_RINKEBY = exports.USDT_ARBITRUM_RINKEBY = exports.DAI_ARBITRUM_RINKEBY = exports.DAI_ARBITRUM = exports.WBTC_ARBITRUM = exports.USDT_ARBITRUM = exports.USDC_ARBITRUM = exports.DAI_OPTIMISTIC_KOVAN = exports.WBTC_OPTIMISTIC_KOVAN = exports.USDT_OPTIMISTIC_KOVAN = exports.USDC_OPTIMISTIC_KOVAN = exports.DAI_OPTIMISM = exports.WBTC_OPTIMISM = exports.USDT_OPTIMISM = exports.USDC_OPTIMISM = exports.DAI_KOVAN = exports.WBTC_KOVAN = exports.USDT_KOVAN = exports.USDC_KOVAN = exports.DAI_BSCTESTNET = exports.DAI_GÖRLI = exports.WBTC_GÖRLI = exports.USDT_GÖRLI = exports.USDC_GÖRLI = exports.USDT_RINKEBY = exports.USDC_RINKEBY = exports.DAI_RINKEBY_2 = exports.DAI_RINKEBY_1 = exports.DAI_ROPSTEN = exports.USDT_ROPSTEN = exports.USDC_ROPSTEN = exports.FEI_MAINNET = exports.DAI_MAINNET = exports.WBTC_MAINNET = exports.USDT_MAINNET = exports.USDC_MAINNET = void 0;
exports.TokenProvider = exports.WETH_POLYGON_MUMBAI = exports.DAI_POLYGON_MUMBAI = exports.USDC_POLYGON_MUMBAI = exports.WMATIC_POLYGON_MUMBAI = exports.DAI_POLYGON = exports.USDT_POLYGON = void 0;
const sdk_core_1 = require("@uniswap/sdk-core");
const lodash_1 = __importDefault(require("lodash"));
const IERC20Metadata__factory_1 = require("../types/v3/factories/IERC20Metadata__factory");
const util_1 = require("../util");
// Some well known tokens on each chain for seeding cache / testing.
exports.USDC_MAINNET = new sdk_core_1.Token(util_1.ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C');
exports.USDT_MAINNET = new sdk_core_1.Token(util_1.ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD');
exports.WBTC_MAINNET = new sdk_core_1.Token(util_1.ChainId.MAINNET, '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', 8, 'WBTC', 'Wrapped BTC');
exports.DAI_MAINNET = new sdk_core_1.Token(util_1.ChainId.MAINNET, '0x6B175474E89094C44Da98b954EedeAC495271d0F', 18, 'DAI', 'Dai Stablecoin');
exports.FEI_MAINNET = new sdk_core_1.Token(util_1.ChainId.MAINNET, '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 18, 'FEI', 'Fei USD');
exports.USDC_ROPSTEN = new sdk_core_1.Token(util_1.ChainId.ROPSTEN, '0x07865c6e87b9f70255377e024ace6630c1eaa37f', 6, 'USDC', 'USD//C');
exports.USDT_ROPSTEN = new sdk_core_1.Token(util_1.ChainId.ROPSTEN, '0x516de3a7a567d81737e3a46ec4ff9cfd1fcb0136', 6, 'USDT', 'Tether USD');
exports.DAI_ROPSTEN = new sdk_core_1.Token(util_1.ChainId.ROPSTEN, '0xad6d458402f60fd3bd25163575031acdce07538d', 18, 'DAI', 'Dai Stablecoin');
exports.DAI_RINKEBY_1 = new sdk_core_1.Token(util_1.ChainId.RINKEBY, '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea', 18, 'DAI', 'DAI');
exports.DAI_RINKEBY_2 = new sdk_core_1.Token(util_1.ChainId.RINKEBY, '0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735', 18, 'DAI', 'DAI');
exports.USDC_RINKEBY = new sdk_core_1.Token(util_1.ChainId.RINKEBY, '0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b', 6, 'tUSDC', 'test USD//C');
exports.USDT_RINKEBY = new sdk_core_1.Token(util_1.ChainId.RINKEBY, '0xa689352b7c1cad82864beb1d90679356d3962f4d', 18, 'USDT', 'Tether USD');
exports.USDC_GÖRLI = new sdk_core_1.Token(util_1.ChainId.GÖRLI, '0x07865c6e87b9f70255377e024ace6630c1eaa37f', 6, 'USDC', 'USD//C');
exports.USDT_GÖRLI = new sdk_core_1.Token(util_1.ChainId.GÖRLI, '0xe583769738b6dd4e7caf8451050d1948be717679', 18, 'USDT', 'Tether USD');
exports.WBTC_GÖRLI = new sdk_core_1.Token(util_1.ChainId.GÖRLI, '0xa0a5ad2296b38bd3e3eb59aaeaf1589e8d9a29a9', 8, 'WBTC', 'Wrapped BTC');
exports.DAI_GÖRLI = new sdk_core_1.Token(util_1.ChainId.GÖRLI, '0x11fe4b6ae13d2a6055c8d9cf65c55bac32b5d844', 18, 'DAI', 'Dai Stablecoin');
exports.DAI_BSCTESTNET = new sdk_core_1.Token(util_1.ChainId.BSCTESTNET, '0x1209BFE443F306d2049629f136784Cd1596C5604', 18, 'DAI', 'Dai Stablecoin');
exports.USDC_KOVAN = new sdk_core_1.Token(util_1.ChainId.KOVAN, '0x31eeb2d0f9b6fd8642914ab10f4dd473677d80df', 6, 'USDC', 'USD//C');
exports.USDT_KOVAN = new sdk_core_1.Token(util_1.ChainId.KOVAN, '0xa325f1b1ebb748715dfbbaf62e0c6677e137f45d', 18, 'USDT', 'Tether USD');
exports.WBTC_KOVAN = new sdk_core_1.Token(util_1.ChainId.KOVAN, '0xe36bc5d8b689ad6d80e78c3e736670e80d4b329d', 8, 'WBTC', 'Wrapped BTC');
exports.DAI_KOVAN = new sdk_core_1.Token(util_1.ChainId.KOVAN, '0x9dc7b33c3b63fc00ed5472fbd7813edda6a64752', 18, 'DAI', 'Dai Stablecoin');
exports.USDC_OPTIMISM = new sdk_core_1.Token(util_1.ChainId.OPTIMISM, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 6, 'USDC', 'USD//C');
exports.USDT_OPTIMISM = new sdk_core_1.Token(util_1.ChainId.OPTIMISM, '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', 6, 'USDT', 'Tether USD');
exports.WBTC_OPTIMISM = new sdk_core_1.Token(util_1.ChainId.OPTIMISM, '0x68f180fcCe6836688e9084f035309E29Bf0A2095', 8, 'WBTC', 'Wrapped BTC');
exports.DAI_OPTIMISM = new sdk_core_1.Token(util_1.ChainId.OPTIMISM, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai Stablecoin');
exports.USDC_OPTIMISTIC_KOVAN = new sdk_core_1.Token(util_1.ChainId.OPTIMISTIC_KOVAN, '0x3b8e53b3ab8e01fb57d0c9e893bc4d655aa67d84', 6, 'USDC', 'USD//C');
exports.USDT_OPTIMISTIC_KOVAN = new sdk_core_1.Token(util_1.ChainId.OPTIMISTIC_KOVAN, '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', 6, 'USDT', 'Tether USD');
exports.WBTC_OPTIMISTIC_KOVAN = new sdk_core_1.Token(util_1.ChainId.OPTIMISTIC_KOVAN, '0x2382a8f65b9120E554d1836a504808aC864E169d', 8, 'WBTC', 'Wrapped BTC');
exports.DAI_OPTIMISTIC_KOVAN = new sdk_core_1.Token(util_1.ChainId.OPTIMISTIC_KOVAN, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai Stablecoin');
exports.USDC_ARBITRUM = new sdk_core_1.Token(util_1.ChainId.ARBITRUM_ONE, '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 6, 'USDC', 'USD//C');
exports.USDT_ARBITRUM = new sdk_core_1.Token(util_1.ChainId.ARBITRUM_ONE, '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 6, 'USDT', 'Tether USD');
exports.WBTC_ARBITRUM = new sdk_core_1.Token(util_1.ChainId.ARBITRUM_ONE, '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', 8, 'WBTC', 'Wrapped BTC');
exports.DAI_ARBITRUM = new sdk_core_1.Token(util_1.ChainId.ARBITRUM_ONE, '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 18, 'DAI', 'Dai Stablecoin');
// export const DAI_ARBITRUM_RINKEBY = new Token(
//   ChainId.ARBITRUM_RINKEBY,
//   '0x2f3C1B6A51A469051A22986aA0dDF98466cc8D3c',
//   18,
//   'DAI',
//   'Dai Stablecoin'
// );
// higher liquidity in dai-weth pool on arb-rinkeby
exports.DAI_ARBITRUM_RINKEBY = new sdk_core_1.Token(util_1.ChainId.ARBITRUM_RINKEBY, '0x5364dc963c402aaf150700f38a8ef52c1d7d7f14', 18, 'DAI', 'Dai Stablecoin');
exports.USDT_ARBITRUM_RINKEBY = new sdk_core_1.Token(util_1.ChainId.ARBITRUM_RINKEBY, '0x920b9301c2de92186299cd2abc7199e25b9728b3', 6, 'UDST', 'Tether USD');
exports.USDC_ARBITRUM_RINKEBY = new sdk_core_1.Token(util_1.ChainId.ARBITRUM_RINKEBY, '0x09b98f8b2395d076514037ff7d39a091a536206c', 6, 'USDC', 'USD//C');
exports.UNI_ARBITRUM_RINKEBY = new sdk_core_1.Token(util_1.ChainId.ARBITRUM_RINKEBY, '0x049251a7175071316e089d0616d8b6aacd2c93b8', 18, 'UNI', 'Uni token');
//gnosis tokens
exports.WXDAI_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', 18, 'WXDAI', 'Wrapped XDAI');
exports.WETH_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', 18, 'WETH', 'Wrapped Ether');
exports.USDC_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', 18, 'USDC', 'USDC');
exports.USDT_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0x4ECaBa5870353805a9F068101A40E0f32ed605C6', 18, 'USDT', 'USDT');
exports.WBTC_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0x8e5bBbb09Ed1ebdE8674Cda39A0c169401db4252', 18, 'WBTC', 'Wrapped BTC');
exports.HONEY_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0x71850b7e9ee3f13ab46d67167341e4bdc905eef9', 18, 'HNY', 'Honey');
exports.AGVE_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0x3a97704a1b25F08aa230ae53B352e2e72ef52843', 18, 'AGVE', 'Agave token');
exports.GIV_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75', 18, 'GIV', 'Giveth');
exports.TEC_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0x5df8339c5e282ee48c0c7ce8a7d01a73d38b3b27', 18, 'TEC', 'Token Engineering Commons');
exports.GNO_GNOSIS = new sdk_core_1.Token(util_1.ChainId.GNOSIS, '0x9c58bacc331c9aa871afd802db6379a98e80cedb', 18, 'GNO', 'Gnosis Token');
//polygon tokens
exports.WMATIC_POLYGON = new sdk_core_1.Token(util_1.ChainId.POLYGON, '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', 18, 'WMATIC', 'Wrapped MATIC');
exports.WETH_POLYGON = new sdk_core_1.Token(util_1.ChainId.POLYGON, '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', 18, 'WETH', 'Wrapped Ether');
exports.USDC_POLYGON = new sdk_core_1.Token(util_1.ChainId.POLYGON, '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', 6, 'USDC', 'USD//C');
exports.USDT_POLYGON = new sdk_core_1.Token(util_1.ChainId.POLYGON, '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 6, 'USDT', 'USDT');
exports.DAI_POLYGON = new sdk_core_1.Token(util_1.ChainId.POLYGON, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 18, 'DAI', 'Dai Stablecoin');
//polygon mumbai tokens
exports.WMATIC_POLYGON_MUMBAI = new sdk_core_1.Token(util_1.ChainId.POLYGON_MUMBAI, '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889', 18, 'WMATIC', 'Wrapped MATIC');
exports.USDC_POLYGON_MUMBAI = new sdk_core_1.Token(util_1.ChainId.POLYGON_MUMBAI, '0xe11a86849d99f524cac3e7a0ec1241828e332c62', 6, 'USDC', 'USD//C');
exports.DAI_POLYGON_MUMBAI = new sdk_core_1.Token(util_1.ChainId.POLYGON_MUMBAI, '0x001b3b4d0f3714ca98ba10f6042daebf0b1b7b6f', 18, 'DAI', 'Dai Stablecoin');
exports.WETH_POLYGON_MUMBAI = new sdk_core_1.Token(util_1.ChainId.POLYGON_MUMBAI, '0xa6fa4fb5f76172d178d61b04b0ecd319c5d1c0aa', 18, 'WETH', 'Wrapped Ether');
class TokenProvider {
    constructor(chainId, multicall2Provider) {
        this.chainId = chainId;
        this.multicall2Provider = multicall2Provider;
    }
    async getTokens(_addresses, providerConfig) {
        const addressToToken = {};
        const symbolToToken = {};
        const addresses = (0, lodash_1.default)(_addresses)
            .map((address) => address.toLowerCase())
            .uniq()
            .value();
        if (addresses.length > 0) {
            const [symbolsResult, decimalsResult] = await Promise.all([
                this.multicall2Provider.callSameFunctionOnMultipleContracts({
                    addresses,
                    contractInterface: IERC20Metadata__factory_1.IERC20Metadata__factory.createInterface(),
                    functionName: 'symbol',
                    providerConfig,
                }),
                this.multicall2Provider.callSameFunctionOnMultipleContracts({
                    addresses,
                    contractInterface: IERC20Metadata__factory_1.IERC20Metadata__factory.createInterface(),
                    functionName: 'decimals',
                    providerConfig,
                }),
            ]);
            const { results: symbols } = symbolsResult;
            const { results: decimals } = decimalsResult;
            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i];
                const symbolResult = symbols[i];
                const decimalResult = decimals[i];
                if (!(symbolResult === null || symbolResult === void 0 ? void 0 : symbolResult.success) || !(decimalResult === null || decimalResult === void 0 ? void 0 : decimalResult.success)) {
                    util_1.log.info({
                        symbolResult,
                        decimalResult,
                    }, `Dropping token with address ${address} as symbol or decimal are invalid`);
                    continue;
                }
                const symbol = symbolResult.result[0];
                const decimal = decimalResult.result[0];
                addressToToken[address.toLowerCase()] = new sdk_core_1.Token(this.chainId, address, decimal, symbol);
                symbolToToken[symbol.toLowerCase()] =
                    addressToToken[address.toLowerCase()];
            }
            util_1.log.info(`Got token symbol and decimals for ${Object.values(addressToToken).length} out of ${addresses.length} tokens on-chain ${providerConfig ? `as of: ${providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber}` : ''}`);
        }
        return {
            getTokenByAddress: (address) => {
                return addressToToken[address.toLowerCase()];
            },
            getTokenBySymbol: (symbol) => {
                return symbolToToken[symbol.toLowerCase()];
            },
            getAllTokens: () => {
                return Object.values(addressToToken);
            },
        };
    }
}
exports.TokenProvider = TokenProvider;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tcHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3Rva2VuLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQSxnREFBMEM7QUFDMUMsb0RBQXVCO0FBQ3ZCLDJGQUF3RjtBQUN4RixrQ0FBdUM7QUE4QnZDLG9FQUFvRTtBQUN2RCxRQUFBLFlBQVksR0FBRyxJQUFJLGdCQUFLLENBQ25DLGNBQU8sQ0FBQyxPQUFPLEVBQ2YsNENBQTRDLEVBQzVDLENBQUMsRUFDRCxNQUFNLEVBQ04sUUFBUSxDQUNULENBQUM7QUFDVyxRQUFBLFlBQVksR0FBRyxJQUFJLGdCQUFLLENBQ25DLGNBQU8sQ0FBQyxPQUFPLEVBQ2YsNENBQTRDLEVBQzVDLENBQUMsRUFDRCxNQUFNLEVBQ04sWUFBWSxDQUNiLENBQUM7QUFDVyxRQUFBLFlBQVksR0FBRyxJQUFJLGdCQUFLLENBQ25DLGNBQU8sQ0FBQyxPQUFPLEVBQ2YsNENBQTRDLEVBQzVDLENBQUMsRUFDRCxNQUFNLEVBQ04sYUFBYSxDQUNkLENBQUM7QUFDVyxRQUFBLFdBQVcsR0FBRyxJQUFJLGdCQUFLLENBQ2xDLGNBQU8sQ0FBQyxPQUFPLEVBQ2YsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixLQUFLLEVBQ0wsZ0JBQWdCLENBQ2pCLENBQUM7QUFDVyxRQUFBLFdBQVcsR0FBRyxJQUFJLGdCQUFLLENBQ2xDLGNBQU8sQ0FBQyxPQUFPLEVBQ2YsNENBQTRDLEVBQzVDLEVBQUUsRUFDRixLQUFLLEVBQ0wsU0FBUyxDQUNWLENBQUM7QUFFVyxRQUFBLFlBQVksR0FBRyxJQUFJLGdCQUFLLENBQ25DLGNBQU8sQ0FBQyxPQUFPLEVBQ2YsNENBQTRDLEVBQzVDLENBQUMsRUFDRCxNQUFNLEVBQ04sUUFBUSxDQUNULENBQUM7QUFDVyxRQUFBLFlBQVksR0FBRyxJQUFJLGdCQUFLLENBQ25DLGNBQU8sQ0FBQyxPQUFPLEVBQ2YsNENB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