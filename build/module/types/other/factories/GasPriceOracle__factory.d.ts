import { Signer } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { GasPriceOracle, GasPriceOracleInterface } from "../GasPriceOracle";
export declare class GasPriceOracle__factory {
    static readonly abi: ({
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
        name?: undefined;
        outputs?: undefined;
    } | {
        anonymous: boolean;
        inputs: {
            indexed: boolean;
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        type: string;
        stateMutability?: undefined;
        outputs?: undefined;
    } | {
        inputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        name: string;
        outputs: {
            internalType: string;
            name: string;
            type: string;
        }[];
        stateMutability: string;
        type: string;
        anonymous?: undefined;
    })[];
    static createInterface(): GasPriceOracleInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): GasPriceOracle;
}
