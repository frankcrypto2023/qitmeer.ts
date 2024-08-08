"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decode = decode;
exports.encode = encode;
const bip66 = __importStar(require("bip66"));
const typecheck_1 = __importDefault(require("./typecheck"));
const types_1 = __importDefault(require("./types"));
const uint8arraytools = __importStar(require("uint8array-tools"));
const ZERO = new Uint8Array(1);
function toDER(x) {
    let i = 0;
    while (x[i] === 0)
        ++i;
    if (i === x.length)
        return ZERO;
    x = x.slice(i);
    const res = uint8arraytools.concat([ZERO, x]);
    if (x[0] & 0x80)
        return res.slice(0, 1 + x.length);
    return x;
}
function fromDER(x) {
    if (x[0] === 0x00)
        x = x.slice(1);
    const buffer = new Uint8Array(32);
    const bstart = Math.max(0, 32 - x.length);
    buffer.set(x, bstart);
    return buffer;
}
function decode(buffer) {
    const hashType = uint8arraytools.readUInt8(buffer, buffer.length - 1);
    const hashTypeMod = hashType & ~0x80;
    if (hashTypeMod <= 0 || hashTypeMod >= 4)
        throw new Error("Invalid hashType " + hashType);
    const decode = bip66.decode(buffer.slice(0, -1));
    const r = fromDER(decode.r);
    const s = fromDER(decode.s);
    const res = uint8arraytools.concat([r, s]);
    return {
        signature: res.slice(0, 64),
        hashType: hashType,
    };
}
function encode(signature, hashType) {
    (0, typecheck_1.default)(types_1.default.BufferN(64), signature);
    (0, typecheck_1.default)(types_1.default.UInt8, hashType);
    const hashTypeMod = hashType & ~0x80;
    if (hashTypeMod <= 0 || hashTypeMod >= 4)
        throw new Error("Invalid hashType " + hashType);
    const hashTypeBuffer = new Uint8Array(1);
    uint8arraytools.writeUInt8(hashTypeBuffer, 0, hashType);
    const r = toDER(signature.slice(0, 32));
    const s = toDER(signature.slice(32, 64));
    return uint8arraytools.concat([
        bip66.encode(Buffer.from(r), Buffer.from(s)),
        hashTypeBuffer,
    ]);
}
//# sourceMappingURL=signature.js.map