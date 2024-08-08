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
const ops_1 = __importDefault(require("./ops/ops"));
const map_1 = require("./ops/map");
const utils = __importStar(require("./ops/utils"));
const uint8arraytools = __importStar(require("uint8array-tools"));
class Script {
    constructor() {
        this.version = 1;
        this.stack = [];
    }
    static fromBuffer(buffer) {
        const script = new Script();
        if (buffer instanceof Uint8Array) {
            let i = 0;
            while (i < buffer.length) {
                const opcode = buffer[i];
                if (opcode > ops_1.default.OP_0 &&
                    opcode <= ops_1.default.OP_PUSHDATA4) {
                    const d = utils.decode(buffer, i);
                    if (d === null)
                        return null;
                    i += d.size;
                    if (i + d.number > buffer.length)
                        return null;
                    const data = buffer.slice(i, i + d.number);
                    i += d.number;
                    const op = utils.asMinimalOP(data);
                    if (op !== undefined) {
                        script.stack.push(op);
                    }
                    else {
                        script.stack.push(data);
                    }
                }
                else {
                    script.stack.push(opcode);
                    i += 1;
                }
            }
        }
        return script;
    }
    static fromAsm(asm) {
        const script = new Script();
        script.stack = asm.split(" ").map((chunkStr) => {
            if (ops_1.default[chunkStr] !== undefined)
                return ops_1.default[chunkStr];
            return uint8arraytools.fromHex(chunkStr);
        });
        return script;
    }
    toAsm() {
        return this.stack
            .map((chunk) => {
            if (chunk instanceof Uint8Array) {
                const newchunk = chunk;
                const op = utils.asMinimalOP(newchunk);
                if (op === undefined)
                    return uint8arraytools.toHex(newchunk);
                chunk = op;
            }
            return map_1.map[chunk];
        })
            .join(" ");
    }
    toBuffer() {
        let lockIndex;
        const bufferSize = this.stack.reduce((accum, chunk, i) => {
            if (typeof chunk === "string" && chunk === "cltv") {
                lockIndex = 1;
                return accum;
            }
            if (typeof lockIndex === "number" && lockIndex === i) {
                if (chunk === 0) {
                    return accum + 1;
                }
                else if (chunk >= 1 && chunk <= 16) {
                    return accum + 1;
                }
                else {
                    const result = new Uint8Array(9);
                    let dataLen = 0;
                    let n = chunk;
                    while (n > 0) {
                        uint8arraytools.writeUInt8(result, dataLen, n & 0xff);
                        n >>= 8;
                        dataLen++;
                    }
                    if ((result[dataLen - 1] & 0x80) !== 0) {
                        dataLen++;
                    }
                    return accum + dataLen + 1;
                }
            }
            if (chunk instanceof Uint8Array) {
                const newBuffer = chunk;
                if (newBuffer.length === 1 &&
                    utils.asMinimalOP(newBuffer) !== undefined) {
                    return accum + 1;
                }
                return (accum +
                    utils.encodingLength(newBuffer.length) +
                    newBuffer.length);
            }
            return accum + 1;
        }, 0.0);
        const buffer = new Uint8Array(bufferSize);
        let offset = 0;
        this.stack.forEach((chunk, index) => {
            if (typeof chunk === "string" && chunk === "cltv")
                return;
            if (typeof lockIndex === "number" && lockIndex === index) {
                if (chunk === 0) {
                    uint8arraytools.writeUInt8(buffer, offset, ops_1.default.OP_0);
                    offset += 1;
                }
                else if (chunk >= 1 && chunk <= 16) {
                    uint8arraytools.writeUInt8(buffer, offset, ops_1.default.OP_1 - 1 + chunk);
                    offset += 1;
                }
                else {
                    let dataLen = 0;
                    const data = new Uint8Array(12);
                    let n = chunk;
                    while (n > 0) {
                        uint8arraytools.writeUInt8(data, dataLen, n & 0xff);
                        n >>= 8;
                        dataLen++;
                    }
                    if ((data[dataLen - 1] & 0x80) !== 0) {
                        dataLen++;
                    }
                    uint8arraytools.writeUInt8(buffer, dataLen, offset);
                    offset++;
                    while (chunk > 0) {
                        uint8arraytools.writeUInt8(buffer, offset, chunk & 0xff);
                        chunk >>= 8;
                        offset += 1;
                    }
                    if ((buffer[offset - 1] & 0x80) !== 0) {
                        uint8arraytools.writeUInt8(buffer, offset, 0x00);
                        offset += 1;
                    }
                }
            }
            else if (chunk instanceof Uint8Array) {
                const opcode = utils.asMinimalOP(chunk);
                if (opcode !== undefined) {
                    uint8arraytools.writeUInt8(buffer, offset, opcode);
                    offset += 1;
                    return;
                }
                offset += utils.encode(buffer, chunk.length, offset);
                buffer.set(chunk, offset);
                offset += chunk.length;
            }
            else {
                uint8arraytools.writeUInt8(buffer, offset, chunk);
                offset += 1;
            }
        });
        if (offset !== buffer.length)
            throw new Error("Could not decode chunks");
        return buffer;
    }
    removeOP(op) {
        this.stack = this.stack.filter((x) => x !== op);
        return this;
    }
    removeCodeSeparator() {
        this.removeOP(ops_1.default.OP_CODESEPARATOR);
        return this;
    }
}
Script.types = {
    NONSTANDARD: "nonstandard",
    NULLDATA: "nulldata",
    P2PK: "pubkey",
    P2PKH: "pubkeyhash",
    P2SH: "scripthash",
};
Script.Output = {
    P2PKH: __publicKeyScript,
    CLTV: __cltvScript,
    P2SH: __scriptHash,
};
Script.Input = {
    P2PKH: __signatureScript,
    P2PK: __signatureScript,
};
function __publicKeyScript(hash) {
    const script = new Script();
    script.stack = [
        ops_1.default.OP_DUP,
        ops_1.default.OP_HASH160,
        hash,
        ops_1.default.OP_EQUALVERIFY,
        ops_1.default.OP_CHECKSIG,
    ];
    return script;
}
function __cltvScript(hash, lockTime) {
    const script = new Script();
    script.stack = [
        "cltv",
        lockTime,
        ops_1.default.OP_CHECKLOCKTIMEVERIFY,
        ops_1.default.OP_DROP,
        ops_1.default.OP_DUP,
        ops_1.default.OP_HASH160,
        hash,
        ops_1.default.OP_EQUALVERIFY,
        ops_1.default.OP_CHECKSIG,
    ];
    return script;
}
function __scriptHash(hash) {
    const script = new Script();
    script.stack = [ops_1.default.OP_HASH160, hash, ops_1.default.OP_EQUAL];
    return script;
}
function __signatureScript(signature, pubkey) {
    const script = new Script();
    script.stack = [signature, pubkey];
    return script;
}
exports.default = Script;
//# sourceMappingURL=script.js.map