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
const utils = __importStar(require("./utils"));
const varuint = __importStar(require("varuint-bitcoin"));
const hash = __importStar(require("./hash"));
const types_1 = __importDefault(require("./types"));
const typecheck_1 = __importDefault(require("./typecheck"));
const uint8arraytools = __importStar(require("uint8array-tools"));
class Transaction {
    constructor() {
        this.version = 1;
        this._stype = 0;
        this.locktime = 0;
        this.exprie = 0;
        this.timestamp = 0;
        this.vin = [];
        this.vout = [];
    }
    static fromBuffer(buffer, __noStrict) {
        let offset = 0;
        function readSlice(n) {
            offset += n;
            return buffer.slice(offset - n, offset);
        }
        function readUInt16() {
            const i = uint8arraytools.readUInt16(buffer, offset, "LE");
            offset += 2;
            return i;
        }
        function readUInt32() {
            const i = uint8arraytools.readUInt32(buffer, offset, "LE");
            offset += 4;
            return i;
        }
        function readUInt64() {
            const i = utils.readUInt64LE(buffer, offset);
            offset += 8;
            return BigInt(i);
        }
        function readVarInt() {
            const vi = varuint.decode(Buffer.from(buffer), offset);
            offset += varuint.decode.bytes;
            return vi;
        }
        function readVarSlice() {
            return readSlice(readVarInt());
        }
        const tx = new Transaction();
        tx.version = readUInt16();
        tx._stype = readUInt16();
        if (tx._stype !== Transaction.TxSerializeFull &&
            tx._stype !== Transaction.TxSerializeNoWitness &&
            tx._stype !== Transaction.TxSerializeOnlyWitness) {
            throw new Error("unsupported tx serialize type " + tx._stype);
        }
        let vinLen = 0;
        if (tx._stype === Transaction.TxSerializeFull ||
            tx._stype === Transaction.TxSerializeNoWitness) {
            vinLen = readVarInt();
            for (let i = 0; i < vinLen; ++i) {
                tx.vin.push({
                    txid: readSlice(32),
                    vout: readUInt32(),
                    sequence: readUInt32(),
                    script: new Uint8Array(0),
                });
            }
            const voutLen = readVarInt();
            for (let i = 0; i < voutLen; ++i) {
                const conId = readUInt16();
                tx.vout.push({
                    coinId: types_1.default.CoinId(conId),
                    amount: readUInt64(),
                    script: readVarSlice(),
                });
            }
            tx.locktime = readUInt32();
            tx.exprie = readUInt32();
        }
        const hasWitnesses = tx._stype !== Transaction.TxSerializeNoWitness;
        tx.timestamp = hasWitnesses ? readUInt32() : 0;
        if (hasWitnesses) {
            const witnessLen = readVarInt();
            if (witnessLen > 0 && witnessLen !== vinLen)
                throw new Error("Wrong witness length");
            vinLen = witnessLen;
        }
        for (let i = 0; i < vinLen; ++i) {
            tx.vin[i].script = hasWitnesses
                ? readVarSlice()
                : uint8arraytools.fromHex("");
        }
        if (__noStrict)
            return tx;
        if (offset !== buffer.length)
            throw new Error("Transaction has unexpected data");
        return tx;
    }
    hasWitnesses() {
        return this._stype === 0;
    }
    byteLength(stype) {
        let hasWitnesses = this.hasWitnesses();
        let onlyWitnesses = false;
        if (stype !== undefined) {
            hasWitnesses =
                stype === Transaction.TxSerializeFull ||
                    stype === Transaction.TxSerializeOnlyWitness;
            onlyWitnesses = stype === Transaction.TxSerializeOnlyWitness;
        }
        const twoUint8Arr = new Uint8Array(2);
        const length = 4 +
            (onlyWitnesses ? 0 : varuint.encodingLength(this.vin.length)) +
            (onlyWitnesses ? 0 : varuint.encodingLength(this.vout.length)) +
            (onlyWitnesses ? 0 : this.vin.reduce((sum) => sum + 32 + 4 + 4, 0)) +
            (onlyWitnesses
                ? 0
                : this.vout.reduce((sum, output) => 2 + sum + 8 + varSliceSize(output.script), 0)) +
            (onlyWitnesses ? 0 : 4 + 4) +
            (hasWitnesses ? 4 : 0) +
            (hasWitnesses ? varuint.encodingLength(this.vin.length) : 0) +
            (hasWitnesses
                ? this.vin.reduce((sum, input) => sum +
                    (uint8arraytools.compare(twoUint8Arr, input.script) === 0
                        ? 1
                        : varSliceSize(input.script)), 0)
                : 0);
        return length;
    }
    toHex() {
        return uint8arraytools.toHex(this.toBuffer());
    }
    toBuffer(buffer, initialOffset, stype) {
        if (!buffer)
            buffer = new Uint8Array(this.byteLength(stype));
        let offset = initialOffset || 0;
        function writeSlice(slice) {
            buffer.set(slice, offset);
            offset += slice.length;
        }
        function writeUInt16(i) {
            uint8arraytools.writeUInt16(buffer, offset, i, "LE");
            offset += 2;
        }
        function writeUInt32(i) {
            uint8arraytools.writeUInt32(buffer, offset, i, "LE");
            offset += 4;
        }
        function writeInt32(i) {
            uint8arraytools.writeUInt32(buffer, offset, i, "LE");
            offset += 4;
        }
        function writeUInt64(i) {
            offset = utils.writeUInt64LE(buffer, Number(i), offset);
        }
        function writeVarInt(i) {
            const buf = Buffer.from(buffer);
            varuint.encode(i, buf, offset);
            buffer === null || buffer === void 0 ? void 0 : buffer.set(buf.subarray(offset, offset + varuint.encode.bytes), offset);
            offset += varuint.encode.bytes;
        }
        function writeVarSlice(slice) {
            writeVarInt(slice.length);
            writeSlice(slice);
        }
        const serializeType = stype || this._stype;
        if (serializeType === Transaction.TxSerializeFull) {
            writeInt32(this.version);
        }
        else {
            writeUInt16(this.version);
            writeUInt16(stype);
        }
        if (serializeType === Transaction.TxSerializeFull ||
            serializeType === Transaction.TxSerializeNoWitness) {
            writeVarInt(this.vin.length);
            this.vin.forEach(function (txIn) {
                writeSlice(txIn.txid);
                writeUInt32(txIn.vout);
                writeUInt32(txIn.sequence);
            });
            writeVarInt(this.vout.length);
            this.vout.forEach(function (txOut) {
                writeUInt16(txOut.coinId);
                writeUInt64(txOut.amount);
                writeVarSlice(txOut.script);
            });
            writeUInt32(this.locktime);
            writeUInt32(this.exprie);
        }
        if (serializeType !== Transaction.TxSerializeNoWitness) {
            writeUInt32(this.timestamp);
        }
        if (serializeType !== Transaction.TxSerializeNoWitness) {
            writeVarInt(this.vin.length);
            const twoUint8Array = new Uint8Array(2);
            this.vin.forEach(function (input) {
                if (uint8arraytools.compare(twoUint8Array, input.script) !== 0)
                    writeVarSlice(input.script);
            });
        }
        if (initialOffset !== undefined)
            return buffer.slice(initialOffset, offset);
        return buffer;
    }
    getTxIdBuffer() {
        return hash.dblake2b256(this.toBuffer(undefined, undefined, Transaction.TxSerializeNoWitness));
    }
    getTxId() {
        return uint8arraytools.toHex(this.getTxIdBuffer().reverse());
    }
    getTxHash() {
        return uint8arraytools.toHex(this.getTxHashBuffer().reverse());
    }
    getTxHashBuffer() {
        return hash.dblake2b256(uint8arraytools.concat([
            this.toBuffer(undefined, undefined, Transaction.TxSerializeFull),
        ]));
    }
    addInput(hash, index, sequence, scriptSig) {
        (0, typecheck_1.default)(types_1.default.Hash256, hash);
        (0, typecheck_1.default)(types_1.default.UInt32, index);
        if (types_1.default.Nil(sequence)) {
            sequence = Transaction.DEFAULT_SEQUENCE;
        }
        if (types_1.default.Nil(scriptSig)) {
            scriptSig = new Uint8Array(0);
        }
        const size = this.vin.push({
            txid: hash,
            vout: index,
            sequence: sequence,
            script: scriptSig,
        });
        return size - 1;
    }
    addOutput(scriptPubKey, amount, coinId = 0) {
        (0, typecheck_1.default)(types_1.default.Uint8Array, scriptPubKey);
        (0, typecheck_1.default)(types_1.default.Amount, Number(amount));
        return (this.vout.push({
            coinId,
            amount: amount,
            script: scriptPubKey,
        }) - 1);
    }
    setInputScript(index, scriptSig) {
        (0, typecheck_1.default)(types_1.default.Number, index);
        (0, typecheck_1.default)(types_1.default.Uint8Array, scriptSig);
        this.vin[index].script = scriptSig;
    }
    clone() {
        const newTx = new Transaction();
        newTx._stype = this._stype;
        newTx.version = this.version;
        newTx.vin = this.vin.map(function (txIn) {
            return {
                txid: txIn.txid,
                vout: txIn.vout,
                sequence: txIn.sequence,
                script: txIn.script,
            };
        });
        newTx.vout = this.vout.map(function (txOut) {
            return {
                coinId: txOut.coinId,
                amount: txOut.amount,
                script: txOut.script,
            };
        });
        newTx.locktime = this.locktime;
        newTx.exprie = this.exprie;
        newTx.timestamp = this.timestamp;
        return newTx;
    }
    hashForSignature(inIndex, prevOutScript, hashType) {
        const fSingle = (hashType & SigHashMask) === Transaction.SIGHASH_SINGLE;
        const fNone = (hashType & SigHashMask) === Transaction.SIGHASH_NONE;
        const fAnyOne = (hashType & Transaction.SIGHASH_ANYONECANPAY) !== 0;
        if (inIndex >= this.vin.length) {
            throw new Error("invalid input index " +
                inIndex +
                ", out of the range of tx input " +
                this.vin.length);
        }
        if (fSingle && inIndex >= this.vout.length) {
            throw new Error("invalid input index " +
                inIndex +
                "for SIGHASH_SINGLE, out of the range of tx output " +
                this.vin.length);
        }
        const ourScript = prevOutScript.removeCodeSeparator().toBuffer();
        const txTmp = this.clone();
        if (fAnyOne) {
            txTmp.vin = [txTmp.vin[inIndex]];
            txTmp.vin[0].script = ourScript;
        }
        txTmp.vin.forEach(function (input) {
            input.script = new Uint8Array(0);
        });
        txTmp.vin[inIndex].script = ourScript;
        if (fNone) {
            txTmp.vout = [];
            txTmp.vin.forEach(function (input, i) {
                if (i === inIndex)
                    return;
                input.sequence = 0;
            });
        }
        else if (fSingle) {
            txTmp.vout.length = inIndex + 1;
            for (let i = 0; i < inIndex; i++) {
                txTmp.vout[i] = BLANK_OUTPUT;
            }
            txTmp.vin.forEach(function (input, y) {
                if (y === inIndex)
                    return;
                input.sequence = 0;
            });
        }
        function sigHashPrefixSerializeSize(txIns, txOuts, inIndex) {
            const nTxIns = txIns.length;
            const nTxOuts = txOuts.length;
            let size = 4 +
                varuint.encodingLength(nTxIns) +
                nTxIns * (32 + 4 + 1 + 4) +
                varuint.encodingLength(nTxOuts) +
                nTxOuts * (2 + 8) +
                4 +
                4;
            txOuts.forEach(function (output, i) {
                let s = output.script;
                if (fSingle && i !== inIndex) {
                    s = new Uint8Array(0);
                }
                size += varuint.encodingLength(s.length);
                size += s.length;
            });
            return size;
        }
        function sigHashWitnessSerializeSize(txIns, signScript) {
            const nTxIns = txIns.length;
            const size = 4 +
                varuint.encodingLength(nTxIns) +
                (nTxIns - 1) +
                varSliceSize(signScript);
            return size;
        }
        function writeSlice(buffer, slice, offset) {
            buffer.set(slice, offset);
            return offset + slice.length;
        }
        function writeUInt16(buffer, i, offset) {
            uint8arraytools.writeUInt16(buffer, offset, i, "LE");
            return offset + 2;
        }
        function writeUInt32(buffer, i, offset) {
            uint8arraytools.writeUInt32(buffer, offset, i, "LE");
            return offset + 4;
        }
        function writeUInt64(buffer, i, offset) {
            const o = utils.writeUInt64LE(buffer, Number(i), offset);
            return o;
        }
        function writeVarInt(buffer, i, offset) {
            const buf = Buffer.from(buffer);
            varuint.encode(i, buf, offset);
            const o = varuint.encode.bytes;
            buffer.set(buf.subarray(offset, offset + o), offset);
            return offset + o;
        }
        function writeVarSlice(buffer, slice, offset) {
            let o = writeVarInt(buffer, slice.length, offset);
            o = writeSlice(buffer, slice, o);
            return o;
        }
        const prefixBuffer = new Uint8Array(sigHashPrefixSerializeSize(txTmp.vin, txTmp.vout, inIndex));
        prefixBuffer.fill(0);
        let offset = 0;
        offset = writeUInt16(prefixBuffer, txTmp.version, offset);
        offset = writeUInt16(prefixBuffer, SigHashSerializePrefix, offset);
        offset = writeVarInt(prefixBuffer, txTmp.vin.length, offset);
        txTmp.vin.forEach(function (txIn) {
            offset = writeSlice(prefixBuffer, txIn.txid, offset);
            offset = writeUInt32(prefixBuffer, txIn.vout, offset);
            offset = writeUInt32(prefixBuffer, txIn.sequence, offset);
        });
        offset = writeVarInt(prefixBuffer, txTmp.vout.length, offset);
        txTmp.vout.forEach(function (txOut) {
            offset = writeUInt16(prefixBuffer, txOut.coinId, offset);
            offset = writeUInt64(prefixBuffer, txOut.amount, offset);
            offset = writeVarSlice(prefixBuffer, txOut.script, offset);
        });
        offset = writeUInt32(prefixBuffer, txTmp.locktime, offset);
        offset = writeUInt32(prefixBuffer, txTmp.exprie, offset);
        const witnessBuffer = new Uint8Array(sigHashWitnessSerializeSize(txTmp.vin, ourScript));
        witnessBuffer.fill(0);
        offset = 0;
        offset = writeUInt16(witnessBuffer, txTmp.version, offset);
        offset = writeUInt16(witnessBuffer, SigHashSerializeWitness, offset);
        offset = writeVarInt(witnessBuffer, txTmp.vin.length, offset);
        txTmp.vin.forEach(function (txIn) {
            offset = writeVarSlice(witnessBuffer, txIn.script, offset);
        });
        const typeBuffer = new Uint8Array(4);
        uint8arraytools.writeUInt32(typeBuffer, 0, hashType, "LE");
        const prefixHash = hash.blake2b256(prefixBuffer);
        const witnessHash = hash.blake2b256(witnessBuffer);
        return hash.blake2b256(uint8arraytools.concat([typeBuffer, prefixHash, witnessHash]));
    }
}
Transaction.DEFAULT_SEQUENCE = 0xffffffff;
Transaction.SIGHASH_ALL = 0x01;
Transaction.SIGHASH_NONE = 0x02;
Transaction.SIGHASH_SINGLE = 0x03;
Transaction.SIGHASH_ANYONECANPAY = 0x80;
Transaction.TxSerializeFull = 0;
Transaction.TxSerializeNoWitness = 1;
Transaction.TxSerializeOnlyWitness = 2;
exports.default = Transaction;
const SigHashMask = 0x1f;
const SigHashSerializePrefix = 1;
const SigHashSerializeWitness = 3;
const EMPTY_SCRIPT = new Uint8Array(0);
const BLANK_OUTPUT = {
    coinId: 0,
    amount: BigInt(0),
    script: EMPTY_SCRIPT,
};
function varSliceSize(someScript) {
    const length = someScript.length;
    return varuint.encodingLength(length) + length;
}
//# sourceMappingURL=transaction.js.map