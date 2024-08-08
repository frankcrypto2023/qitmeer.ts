import Script from "./script";
type VinObj = {
    txid: Uint8Array;
    vout: number;
    sequence: number;
    script: Uint8Array;
};
type VoutObj = {
    coinId: any;
    amount: bigint;
    script: Uint8Array;
};
export default class Transaction {
    version: number;
    _stype: number;
    locktime: number;
    exprie: number;
    timestamp: number;
    vin: Array<VinObj>;
    vout: Array<VoutObj>;
    static DEFAULT_SEQUENCE: number;
    static SIGHASH_ALL: number;
    static SIGHASH_NONE: number;
    static SIGHASH_SINGLE: number;
    static SIGHASH_ANYONECANPAY: number;
    static TxSerializeFull: number;
    static TxSerializeNoWitness: number;
    static TxSerializeOnlyWitness: number;
    constructor();
    static fromBuffer(buffer: Uint8Array, __noStrict?: boolean): Transaction;
    hasWitnesses(): boolean;
    byteLength(stype?: number): number;
    toHex(): string;
    toBuffer(buffer?: Uint8Array, initialOffset?: number, stype?: number): Uint8Array;
    getTxIdBuffer(): Uint8Array;
    getTxId(): string;
    getTxHash(): string;
    getTxHashBuffer(): Uint8Array;
    addInput(hash: Uint8Array, index: number, sequence?: number, scriptSig?: Uint8Array): number;
    addOutput(scriptPubKey: Uint8Array, amount: bigint, coinId?: number): number;
    setInputScript(index: number, scriptSig: Uint8Array): void;
    clone(): Transaction;
    hashForSignature(inIndex: number, prevOutScript: Script, hashType: number): Uint8Array;
}
export {};
