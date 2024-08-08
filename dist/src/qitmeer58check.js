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
const bs58_1 = __importDefault(require("bs58"));
const HashFunctions = __importStar(require("./hash"));
const uint8arraytools = __importStar(require("uint8array-tools"));
function Qitmeer58checkBase(checksumFn) {
    function encode(payload) {
        const checksum = checksumFn(payload);
        let res = uint8arraytools.concat([payload, checksum]);
        return bs58_1.default.encode(res.slice(0, payload.length + 4));
    }
    function decodeRaw(buffer) {
        const payload = buffer.slice(0, -4);
        const checksum = buffer.slice(-4);
        const newChecksum = checksumFn(payload);
        if ((checksum[0] ^ newChecksum[0]) |
            (checksum[1] ^ newChecksum[1]) |
            (checksum[2] ^ newChecksum[2]) |
            (checksum[3] ^ newChecksum[3]))
            return undefined;
        return payload;
    }
    function decodeUnsafe(string) {
        const buffer = bs58_1.default.decodeUnsafe(string);
        if (!buffer)
            return undefined;
        return decodeRaw(Uint8Array.from(buffer));
    }
    function decode(string) {
        const buffer = Uint8Array.from(bs58_1.default.decode(string));
        const payload = decodeRaw(buffer);
        if (!payload)
            throw new Error("Invalid checksum");
        return payload;
    }
    return {
        encode,
        decode,
        decodeUnsafe,
    };
}
const qitmeer58check = {
    default: Qitmeer58checkBase(HashFunctions.dblake2b256),
    Qitmeer58checkdsha256: Qitmeer58checkBase(HashFunctions.dsha256),
    Qitmeer58checkBase,
};
exports.default = qitmeer58check;
//# sourceMappingURL=qitmeer58check.js.map