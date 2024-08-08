type DecodeResult = {
    version: number;
    privateKey: Uint8Array;
    compressed: boolean;
};
declare function decodeRaw(buffer: Uint8Array, version?: number): DecodeResult;
declare function encodeRaw(privateKey: Uint8Array, compressed: boolean, version?: number): Uint8Array;
declare function decode(string: string, version?: number): DecodeResult;
declare function encode(privateKey: Uint8Array, compressed: boolean, version?: number): string;
export { decode, decodeRaw, encode, encodeRaw };
