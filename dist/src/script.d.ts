export type SCRIPT_TYPE = {
    NONSTANDARD: string;
    NULLDATA: string;
    P2PK: string;
    P2PKH: string;
    P2SH: string;
};
declare class Script {
    version: number;
    stack: Array<number | Uint8Array | string>;
    constructor();
    static types: SCRIPT_TYPE;
    static Output: {
        P2PKH: typeof __publicKeyScript;
        CLTV: typeof __cltvScript;
        P2SH: typeof __scriptHash;
    };
    static Input: {
        P2PKH: typeof __signatureScript;
        P2PK: typeof __signatureScript;
    };
    static fromBuffer(buffer: Uint8Array): Script | null;
    static fromAsm(asm: string): Script;
    toAsm(): string;
    toBuffer(): Uint8Array;
    removeOP(op: number): Script;
    removeCodeSeparator(): Script;
}
declare function __publicKeyScript(hash: Uint8Array): Script;
declare function __cltvScript(hash: Uint8Array, lockTime: number): Script;
declare function __scriptHash(hash: Uint8Array): Script;
declare function __signatureScript(signature: Uint8Array, pubkey: Uint8Array): Script;
export default Script;
