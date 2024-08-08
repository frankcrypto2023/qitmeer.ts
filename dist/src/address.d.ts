import { NetworkConfig } from "./networks";
import Script from "./script";
type DecodeResult = {
    version: number;
    hash: Uint8Array;
};
export { fromBase58Check, toBase58Check, toOutputScript };
declare function fromBase58Check(address: string): DecodeResult;
declare function toBase58Check(hash: Uint8Array, version: number): string;
declare function toOutputScript(address: string, network: NetworkConfig): Script;
