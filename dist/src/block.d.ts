import Transaction from "./transaction";
type PowData = {
    edge_bits: number;
    circle_nonces: Uint8Array;
};
type BlockPow = {
    nonce: number;
    pow_type: number;
    proof_data: PowData;
};
export default class Block {
    version: number;
    parentRoot: Uint8Array | null;
    txRoot: Uint8Array | null;
    stateRoot: Uint8Array | null;
    difficulty: number;
    timestamp: Date;
    nonce: number;
    transactions: Transaction[];
    parents: Uint8Array[];
    pow: BlockPow;
    constructor();
    static fromBuffer(buffer: Uint8Array): Block;
    byteLength(headersOnly?: boolean): number;
    toBuffer(headersOnly?: boolean): Uint8Array;
    getHashBuffer(): Uint8Array;
    getHash(): string;
    static calculateTxRoot(transactions: Transaction[]): Uint8Array;
    checkTxRoot(): boolean;
}
export {};
