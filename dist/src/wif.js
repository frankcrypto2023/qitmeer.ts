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
exports.decodeRaw = decodeRaw;
exports.encode = encode;
exports.encodeRaw = encodeRaw;
const qitmeer58check_1 = __importDefault(require("./qitmeer58check"));
const types_1 = __importDefault(require("./types"));
const uint8arraytools = __importStar(require("uint8array-tools"));
function decodeRaw(buffer, version) {
    if (version !== undefined && buffer[0] !== version)
        throw new Error("Invalid network version");
    if (buffer.length === 33) {
        return {
            version: buffer[0],
            privateKey: buffer.slice(1, 33),
            compressed: false,
        };
    }
    if (buffer.length !== 34)
        throw new Error("Invalid WIF length");
    if (buffer[33] !== 0x01)
        throw new Error("Invalid compression flag");
    return {
        version: buffer[0],
        privateKey: buffer.slice(1, 33),
        compressed: true,
    };
}
function encodeRaw(privateKey, compressed, version) {
    const result = new Uint8Array(compressed ? 34 : 33);
    if (types_1.default.Nil(version)) {
        version = 0x80;
    }
    uint8arraytools.writeUInt8(result, 0, version);
    result.set(privateKey, 1);
    if (compressed) {
        result[33] = 0x01;
    }
    return result;
}
function decode(string, version) {
    if (types_1.default.Nil(version))
        version = 0x80;
    return decodeRaw(qitmeer58check_1.default.Qitmeer58checkdsha256.decode(string), version);
}
function encode(privateKey, compressed, version) {
    return qitmeer58check_1.default.Qitmeer58checkdsha256.encode(encodeRaw(privateKey, compressed, version));
}
//# sourceMappingURL=wif.js.map