type ChecksumFn = (payload: Uint8Array) => Uint8Array;
type Qitmeer58Check = {
    encode: (payload: Uint8Array) => string;
    decode: (string: string) => Uint8Array;
    decodeUnsafe: (string: string) => Uint8Array | undefined;
};
declare function Qitmeer58checkBase(checksumFn: ChecksumFn): Qitmeer58Check;
declare const qitmeer58check: {
    default: Qitmeer58Check;
    Qitmeer58checkdsha256: Qitmeer58Check;
    Qitmeer58checkBase: typeof Qitmeer58checkBase;
};
export default qitmeer58check;
