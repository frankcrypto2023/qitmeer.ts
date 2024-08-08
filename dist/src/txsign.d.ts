import Transaction from "./transaction";
import Script from "./script";
import { NetworkConfig } from "./networks";
type InputOptions = {
    prevOutType?: string;
    prevOutScript?: Script;
    lockTime?: number;
    sequence?: number;
};
export default class TxSigner {
    private __inputs;
    private __network;
    private __tx;
    constructor(network: NetworkConfig);
    static newSigner(network: NetworkConfig): TxSigner;
    setLockTime(locktime: number): void;
    setVersion(version: number): void;
    setTimestamp(timestamp: number): void;
    addInput(txHash: string, vout: number, options?: InputOptions): void;
    addOutput(address: string, amount: number, coinId?: number): void;
    sign(vin: number, keyPair: any, hashType?: number): void;
    build(): Transaction;
    getTxId(): string;
}
export {};
