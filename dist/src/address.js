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
exports.fromBase58Check = fromBase58Check;
exports.toBase58Check = toBase58Check;
exports.toOutputScript = toOutputScript;
const qitmeer58check_1 = __importDefault(require("./qitmeer58check"));
const script_1 = __importDefault(require("./script"));
const types_1 = __importDefault(require("./types"));
const typecheck_1 = __importDefault(require("./typecheck"));
const uint8arraytools = __importStar(require("uint8array-tools"));
function fromBase58Check(address) {
    const payload = qitmeer58check_1.default.default.decode(address);
    if (!payload || payload.length < 22)
        throw new TypeError(`${address} is too short`);
    if (payload.length > 22)
        throw new TypeError(`${address} is too long`);
    const version = uint8arraytools.readUInt16(payload, 0, "BE");
    const hash = payload.slice(2);
    return { version, hash };
}
function toBase58Check(hash, version) {
    (0, typecheck_1.default)(types_1.default.Hash160, hash);
    const payload = new Uint8Array(22);
    uint8arraytools.writeUInt16(payload, 0, version, "BE");
    payload.set(hash, 2);
    return qitmeer58check_1.default.default.encode(payload);
}
function toOutputScript(address, network) {
    const decode = fromBase58Check(address);
    if (decode) {
        if (decode.version === network.pubKeyHashAddrId)
            return script_1.default.Output.P2PKH(decode.hash);
        if (decode.version === network.ScriptHashAddrID)
            return script_1.default.Output.P2SH(decode.hash);
        throw new Error(`Unknown version ${decode.version}`);
    }
    throw new Error(`Failed to base58check decode ${address}`);
}
//# sourceMappingURL=address.js.map