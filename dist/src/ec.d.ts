import { NetworkConfig } from "./networks";
type ECOptions = {
    compressed?: boolean;
    network?: NetworkConfig;
    rng?: any;
};
declare class EC {
    __priv: Uint8Array | null;
    __pub: Uint8Array | null;
    compressed: boolean;
    network: NetworkConfig;
    constructor(priv: Uint8Array | null, pub: Uint8Array | null, options?: ECOptions);
    get privateKey(): Uint8Array | null;
    get publicKey(): Uint8Array;
    toWIF(): string;
    sign(hash: Uint8Array): Uint8Array;
    verify(hash: Uint8Array, signature: Uint8Array): boolean;
}
declare function fromEntropy(options?: ECOptions): EC;
declare function fromPrivateKey(buffer: Uint8Array, options?: ECOptions): EC;
declare function fromPublicKey(buffer: Uint8Array, options?: ECOptions): EC;
declare function fromWIF(string: string): EC;
export { fromEntropy, fromPrivateKey, fromPublicKey, fromWIF };
