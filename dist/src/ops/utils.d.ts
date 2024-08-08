declare function encodingLength(i: number): number;
declare function encode(buffer: Uint8Array, number: number, offset: number): number;
type DecodeResult = {
    opcode: number;
    number: number;
    size: number;
};
declare function decode(buffer: Uint8Array, offset: number): DecodeResult | null;
declare function asMinimalOP(buffer: Uint8Array): number | undefined;
export { encodingLength, encode, decode, asMinimalOP };
