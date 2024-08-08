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
Object.defineProperty(exports, "__esModule", { value: true });
exports.readUInt64LE = readUInt64LE;
exports.writeUInt64LE = writeUInt64LE;
const uint8arraytools = __importStar(require("uint8array-tools"));
function verifyUInt(value, max) {
    if (typeof value !== "number")
        throw new Error("cannot write a non-number as a number");
    if (value < 0)
        throw new Error("specified a negative value for writing an unsigned value");
    if (value > max)
        throw new Error("RangeError: value out of range");
    if (Math.floor(value) !== value)
        throw new Error("value has a fractional component");
}
function readUInt64LE(buffer, offset) {
    const a = uint8arraytools.readUInt32(buffer, offset, "LE");
    let b = uint8arraytools.readUInt32(buffer, offset + 4, "LE");
    b *= 0x100000000;
    verifyUInt(b + a, 0x001fffffffffffff);
    return b + a;
}
function writeUInt64LE(buffer, value, offset) {
    verifyUInt(value, 0x001fffffffffffff);
    const buf = Buffer.from(buffer);
    const o = buf.writeInt32LE(value & -1, offset);
    buffer.set(buf.subarray(offset, offset + o), offset);
    uint8arraytools.writeUInt32(buffer, offset + 4, Math.floor(value / 0x100000000), "LE");
    return offset + 8;
}
//# sourceMappingURL=utils.js.map