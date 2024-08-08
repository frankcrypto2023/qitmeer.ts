declare function decode(buffer: Uint8Array): {
    signature: Uint8Array;
    hashType: number;
};
declare function encode(signature: Uint8Array, hashType: number): Uint8Array;
export { decode, encode };
