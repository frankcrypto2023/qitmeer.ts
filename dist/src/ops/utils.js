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
exports.encodingLength = encodingLength;
exports.encode = encode;
exports.decode = decode;
exports.asMinimalOP = asMinimalOP;
const ops_1 = __importDefault(require("./ops"));
const uint8arraytools = __importStar(require("uint8array-tools"));
function encodingLength(i) {
    return i < ops_1.default.OP_PUSHDATA1
        ? 1
        : i <= 0xff
            ? 2
            : i <= 0xffff
                ? 3
                : 5;
}
function encode(buffer, number, offset) {
    const size = encodingLength(number);
    if (size === 1) {
        uint8arraytools.writeUInt8(buffer, offset, number);
    }
    else if (size === 2) {
        uint8arraytools.writeUInt8(buffer, offset, ops_1.default.OP_PUSHDATA1);
        uint8arraytools.writeUInt8(buffer, offset + 1, number);
    }
    else if (size === 3) {
        uint8arraytools.writeUInt8(buffer, offset, ops_1.default.OP_PUSHDATA2);
        uint8arraytools.writeUInt16(buffer, offset + 1, number, "LE");
    }
    else {
        uint8arraytools.writeUInt8(buffer, offset, ops_1.default.OP_PUSHDATA4);
        uint8arraytools.writeUInt16(buffer, offset + 1, number, "LE");
    }
    return size;
}
function decode(buffer, offset) {
    const opcode = uint8arraytools.readUInt8(buffer, offset);
    let number;
    let size;
    if (opcode < ops_1.default.OP_PUSHDATA1) {
        number = opcode;
        size = 1;
    }
    else if (opcode === ops_1.default.OP_PUSHDATA1) {
        if (offset + 2 > buffer.length)
            return null;
        number = uint8arraytools.readUInt8(buffer, offset + 1);
        size = 2;
    }
    else if (opcode === ops_1.default.OP_PUSHDATA2) {
        if (offset + 3 > buffer.length)
            return null;
        number = uint8arraytools.readUInt16(buffer, offset + 1, "LE");
        size = 3;
    }
    else {
        if (offset + 5 > buffer.length)
            return null;
        if (opcode !== ops_1.default.OP_PUSHDATA4)
            throw new Error("Unexpected opcode");
        number = uint8arraytools.readUInt32(buffer, offset + 1, "LE");
        size = 5;
    }
    return {
        opcode: opcode,
        number: number,
        size: size,
    };
}
const OP_INT_BASE = ops_1.default.OP_RESERVED;
function asMinimalOP(buffer) {
    if (buffer.length === 0)
        return ops_1.default.OP_0;
    if (buffer.length !== 1)
        return undefined;
    if (buffer[0] >= 1 && buffer[0] <= 16)
        return OP_INT_BASE + buffer[0];
    if (buffer[0] === 0x81)
        return ops_1.default.OP_1NEGATE;
    return undefined;
}
//# sourceMappingURL=utils.js.map