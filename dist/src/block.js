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
const varuint = require("varuint-bitcoin");
const transaction_1 = __importDefault(require("./transaction"));
const hash = __importStar(require("./hash"));
const fastMerkleRoot = require("merkle-lib/fastRoot");
const uint8arraytools = __importStar(require("uint8array-tools"));
const BlockHeaderSize = 4 + 32 + 32 + 32 + 4 + 4 + (4 + 1 + 1 + 168);
class Block {
    constructor() {
        this.version = 1;
        this.parentRoot = null;
        this.txRoot = null;
        this.stateRoot = null;
        this.difficulty = 0;
        this.timestamp = new Date(0);
        this.nonce = 0;
        this.transactions = [];
        this.parents = [];
        this.pow = {
            nonce: 0,
            pow_type: 0,
            proof_data: {
                edge_bits: 0,
                circle_nonces: new Uint8Array(168),
            },
        };
    }
    static fromBuffer(buffer) {
        if (buffer.length < 80)
            throw new Error("Uint8Array too small (< 80 bytes)");
        let offset = 0;
        function readSlice(n) {
            offset += n;
            return buffer.slice(offset - n, offset);
        }
        function readUInt32() {
            const i = uint8arraytools.readUInt32(buffer, offset, "LE");
            offset += 4;
            return i;
        }
        function readInt32() {
            const i = uint8arraytools.readUInt32(buffer, offset, "LE");
            offset += 4;
            return i;
        }
        function readVarInt() {
            const vi = varuint.decode(Buffer.from(buffer), offset);
            offset += varuint.decode.bytes;
            return vi;
        }
        const block = new Block();
        block.version = readInt32();
        block.parentRoot = readSlice(32);
        block.txRoot = readSlice(32);
        block.stateRoot = readSlice(32);
        block.difficulty = readUInt32();
        block.timestamp = new Date(readUInt32() * 1000);
        block.pow = {
            nonce: readUInt32(),
            pow_type: readVarInt(),
            proof_data: {
                edge_bits: readVarInt(),
                circle_nonces: readSlice(168),
            },
        };
        if (buffer.length === BlockHeaderSize)
            return block;
        const parentsLength = readVarInt();
        block.parents = [];
        for (let i = 0; i < parentsLength; ++i) {
            const parent = readSlice(32);
            block.parents.push(parent);
        }
        function readTransaction() {
            const tx = transaction_1.default.fromBuffer(buffer.slice(offset), true);
            offset += tx.byteLength();
            return tx;
        }
        const nTransactions = readVarInt();
        block.transactions = [];
        for (let i = 0; i < nTransactions; ++i) {
            const tx = readTransaction();
            block.transactions.push(tx);
        }
        return block;
    }
    byteLength(headersOnly) {
        if (headersOnly || !this.transactions)
            return BlockHeaderSize;
        const transactionsLength = varuint.encodingLength(this.transactions.length);
        const transactionsByteLength = this.transactions.reduce((a, x) => a + x.byteLength(), 0);
        const parentsLength = varuint.encodingLength(this.parents.length) + this.parents.length * 32;
        return (BlockHeaderSize +
            transactionsLength +
            transactionsByteLength +
            parentsLength);
    }
    toBuffer(headersOnly) {
        const buffer = new Uint8Array(this.byteLength(headersOnly));
        let offset = 0;
        function writeSlice(slice) {
            buffer.set(slice, offset);
            offset += slice.length;
            return offset;
        }
        function writeInt32(i) {
            uint8arraytools.writeUInt32(buffer, offset, i, "LE");
            offset += 4;
            return offset;
        }
        function writeUInt32(i) {
            uint8arraytools.writeUInt32(buffer, offset, i, "LE");
            offset += 4;
            return offset;
        }
        function writeVarInt(i) {
            const buf = Buffer.from(buffer);
            varuint.encode(i, buf, offset);
            buffer.set(buf.subarray(offset, offset + varuint.encode.bytes), offset);
            offset += varuint.encode.bytes;
            return offset;
        }
        writeInt32(this.version);
        writeSlice(this.parentRoot);
        writeSlice(this.txRoot);
        writeSlice(this.stateRoot);
        writeUInt32(this.difficulty);
        const timestamp = Math.floor(this.timestamp.getTime() / 1000);
        writeUInt32(timestamp);
        writeUInt32(this.pow.nonce);
        writeVarInt(this.pow.pow_type);
        writeVarInt(this.pow.proof_data.edge_bits);
        writeSlice(this.pow.proof_data.circle_nonces);
        if (headersOnly || !this.transactions)
            return buffer;
        writeVarInt(this.parents.length);
        this.parents.forEach((parent) => writeSlice(parent));
        writeVarInt(this.transactions.length);
        this.transactions.forEach((tx) => {
            const txSize = tx.byteLength();
            tx.toBuffer(buffer, offset);
            offset += txSize;
        });
        return buffer;
    }
    getHashBuffer() {
        return hash.dblake2b256(this.toBuffer(true).slice(0, BlockHeaderSize - 169));
    }
    getHash() {
        return uint8arraytools.toHex(this.getHashBuffer().reverse());
    }
    static calculateTxRoot(transactions) {
        if (transactions.length === 0)
            throw TypeError("Cannot compute merkle root for zero transactions");
        const hashes = transactions.map((transaction) => transaction.getTxIdBuffer());
        return fastMerkleRoot(hashes, hash.dblake2b256);
    }
    checkTxRoot() {
        if (!this.transactions)
            return false;
        const actualTxRoot = Block.calculateTxRoot(this.transactions);
        return (uint8arraytools.compare(this.txRoot, actualTxRoot) === 0);
    }
}
exports.default = Block;
//# sourceMappingURL=block.js.map