// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

import * as utils from "./utils";
import * as varuint from "varuint-bitcoin";
import * as hash from "./hash";
import types from "./types";
import typecheck from "./typecheck";
import Script from "./script";
import * as uint8arraytools from "uint8array-tools";
type VinObj = {
  txid: Uint8Array;
  vout: number;
  sequence: number;
  script: Uint8Array;
};

type VoutObj = {
  coinId: any;
  amount: bigint;
  script: Uint8Array;
};

export default class Transaction {
  version: number;
  _stype: number;
  locktime: number;
  exprie: number;
  timestamp: number;
  vin: Array<VinObj>;
  vout: Array<VoutObj>;

  static DEFAULT_SEQUENCE = 0xffffffff;

  static SIGHASH_ALL = 0x01;
  static SIGHASH_NONE = 0x02;
  static SIGHASH_SINGLE = 0x03;
  static SIGHASH_ANYONECANPAY = 0x80;

  static TxSerializeFull = 0;
  static TxSerializeNoWitness = 1;
  static TxSerializeOnlyWitness = 2;

  constructor() {
    this.version = 1;
    this._stype = 0; // default = 0, TxSerializeType : 0 - full , 1 - no-witness, 2 - only-witness
    this.locktime = 0;
    this.exprie = 0;
    this.timestamp = 0;
    this.vin = [];
    this.vout = [];
  }

  static fromBuffer(buffer: Uint8Array, __noStrict?: boolean): Transaction {
    let offset = 0;

    function readSlice(n: number): Uint8Array {
      offset += n;
      return buffer.slice(offset - n, offset);
    }

    function readUInt16(): number {
      const i = uint8arraytools.readUInt16(buffer, offset, "LE");
      offset += 2;
      return i;
    }

    function readUInt32(): number {
      const i = uint8arraytools.readUInt32(buffer, offset, "LE");
      offset += 4;
      return i;
    }

    function readUInt64(): bigint {
      const i = utils.readUInt64LE(buffer, offset);
      offset += 8;
      return BigInt(i);
    }

    function readVarInt(): number {
      const vi = varuint.decode(Buffer.from(buffer), offset);
      offset += varuint.decode.bytes;
      return vi;
    }

    function readVarSlice(): Uint8Array {
      return readSlice(readVarInt());
    }

    const tx = new Transaction();

    tx.version = readUInt16(); // tx version

    tx._stype = readUInt16(); // tx serialize type
    if (
      tx._stype !== Transaction.TxSerializeFull &&
      tx._stype !== Transaction.TxSerializeNoWitness &&
      tx._stype !== Transaction.TxSerializeOnlyWitness
    ) {
      throw new Error("unsupported tx serialize type " + tx._stype);
    }
    let vinLen = 0;
    if (
      tx._stype === Transaction.TxSerializeFull ||
      tx._stype === Transaction.TxSerializeNoWitness
    ) {
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
          coinId: types.CoinId(conId),
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
      tx!.vin[i]!.script = hasWitnesses
        ? readVarSlice()
        : uint8arraytools.fromHex("");
    }

    if (__noStrict) return tx;
    if (offset !== buffer.length)
      throw new Error("Transaction has unexpected data");
    return tx;
  }

  hasWitnesses(): boolean {
    return this._stype === 0;
  }

  byteLength(stype?: number): number {
    let hasWitnesses = this.hasWitnesses();
    let onlyWitnesses = false;
    if (stype !== undefined) {
      hasWitnesses =
        stype === Transaction.TxSerializeFull ||
        stype === Transaction.TxSerializeOnlyWitness;
      onlyWitnesses = stype === Transaction.TxSerializeOnlyWitness;
    }
    const twoUint8Arr = new Uint8Array(2);
    const length =
      4 + // version
      (onlyWitnesses ? 0 : varuint.encodingLength(this.vin.length)) +
      (onlyWitnesses ? 0 : varuint.encodingLength(this.vout.length)) +
      (onlyWitnesses ? 0 : this.vin.reduce((sum) => sum + 32 + 4 + 4, 0)) + // txid + vout + seq
      (onlyWitnesses
        ? 0
        : this.vout.reduce(
            (sum, output) => 2 + sum + 8 + varSliceSize(output.script),
            0
          )) + // coinId + amount + script
      (onlyWitnesses ? 0 : 4 + 4) + // lock-time + expire
      (hasWitnesses ? 4 : 0) + // Timestamp
      (hasWitnesses ? varuint.encodingLength(this.vin.length) : 0) + // the varint for witness
      (hasWitnesses
        ? this.vin.reduce(
            (sum, input) =>
              sum +
              (uint8arraytools.compare(twoUint8Arr, input.script) === 0
                ? 1
                : varSliceSize(input.script)),
            0
          )
        : 0); // script
    return length;
  }

  toHex(): string {
    return uint8arraytools.toHex(this.toBuffer());
  }

  toBuffer(
    buffer?: Uint8Array,
    initialOffset?: number,
    stype?: number
  ): Uint8Array {
    if (!buffer) buffer = new Uint8Array(this.byteLength(stype));
    let offset = initialOffset || 0;

    function writeSlice(slice: Uint8Array): void {
      // offset += Buffer.from(slice).copy(Buffer.from(buffer as Uint8Array));
      buffer!.set(slice, offset);
      offset += slice.length;
    }

    function writeUInt16(i: number): void {
      uint8arraytools.writeUInt16(buffer as Uint8Array, offset, i, "LE");
      offset += 2;
    }

    function writeUInt32(i: number): void {
      uint8arraytools.writeUInt32(buffer as Uint8Array, offset, i, "LE");
      offset += 4;
    }

    function writeInt32(i: number): void {
      uint8arraytools.writeUInt32(buffer as Uint8Array, offset, i, "LE");
      offset += 4;
    }

    function writeUInt64(i: bigint): void {
      offset = utils.writeUInt64LE(buffer as Uint8Array, Number(i), offset);
    }

    function writeVarInt(i: number): void {
      const buf = Buffer.from(buffer as Uint8Array);
      varuint.encode(i, buf, offset);
      buffer?.set(buf.subarray(offset, offset + varuint.encode.bytes), offset);
      offset += varuint.encode.bytes;
    }

    function writeVarSlice(slice: Uint8Array): void {
      writeVarInt(slice.length);
      writeSlice(slice);
    }

    const serializeType = stype || this._stype;

    if (serializeType === Transaction.TxSerializeFull) {
      writeInt32(this.version);
    } else {
      writeUInt16(this.version);
      writeUInt16(stype!);
    }

    if (
      serializeType === Transaction.TxSerializeFull ||
      serializeType === Transaction.TxSerializeNoWitness
    ) {
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

    // avoid slicing unless necessary
    if (initialOffset !== undefined)
      return (buffer as Uint8Array).slice(initialOffset, offset);
    return buffer as Uint8Array;
  }

  getTxIdBuffer(): Uint8Array {
    return hash.dblake2b256(
      this.toBuffer(undefined, undefined, Transaction.TxSerializeNoWitness)
    );
  }

  getTxId(): string {
    // transaction hash's are displayed in reverse order
    return uint8arraytools.toHex(this.getTxIdBuffer().reverse());
  }

  getTxHash(): string {
    return uint8arraytools.toHex(this.getTxHashBuffer().reverse());
  }

  getTxHashBuffer(): Uint8Array {
    // transaction hash's are displayed in reverse order
    return hash.dblake2b256(
      uint8arraytools.concat([
        this.toBuffer(undefined, undefined, Transaction.TxSerializeFull),
      ])
    );
  }

  addInput(
    hash: Uint8Array,
    index: number,
    sequence?: number,
    scriptSig?: Uint8Array
  ): number {
    typecheck(types.Hash256, hash);
    typecheck(types.UInt32, index);
    if (types.Nil(sequence)) {
      sequence = Transaction.DEFAULT_SEQUENCE;
    }
    if (types.Nil(scriptSig)) {
      scriptSig = new Uint8Array(0);
    }
    // Add the input and return the input's index
    const size = this.vin.push({
      txid: hash,
      vout: index,
      sequence: sequence!,
      script: scriptSig!,
    });
    return size - 1;
  }

  addOutput(
    scriptPubKey: Uint8Array,
    amount: bigint,
    coinId: number = 0
  ): number {
    typecheck(types.Uint8Array, scriptPubKey);
    typecheck(types.Amount, Number(amount));

    // Add the output and return the output's index
    return (
      this.vout.push({
        coinId,
        amount: amount,
        script: scriptPubKey,
      }) - 1
    );
  }

  setInputScript(index: number, scriptSig: Uint8Array): void {
    typecheck(types.Number, index);
    typecheck(types.Uint8Array, scriptSig);

    this!.vin[index]!.script = scriptSig;
  }

  clone(): Transaction {
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

  hashForSignature(
    inIndex: number,
    prevOutScript: Script,
    hashType: number
  ): Uint8Array {
    const fSingle = (hashType & SigHashMask) === Transaction.SIGHASH_SINGLE;
    const fNone = (hashType & SigHashMask) === Transaction.SIGHASH_NONE;
    const fAnyOne = (hashType & Transaction.SIGHASH_ANYONECANPAY) !== 0;

    // the reference SignHash implementation from :
    // https://github.com/bitcoin/bitcoin/blob/master/src/script/interpreter.cpp

    // check for invalid inIndex
    if (inIndex >= this.vin.length) {
      throw new Error(
        "invalid input index " +
          inIndex +
          ", out of the range of tx input " +
          this.vin.length
      );
    }
    // Check for invalid use of SIGHASH_SINGLE
    if (fSingle && inIndex >= this.vout.length) {
      // out of range of the nOut
      throw new Error(
        "invalid input index " +
          inIndex +
          "for SIGHASH_SINGLE, out of the range of tx output " +
          this.vin.length
      );
    }

    // handle the passed scriptCode, skipping the OP_CODESEPARATOR
    // In case concatenating two scripts ends up with two code-separators,
    // or an extra one at the end, this prevents all those possible incompatibilities.
    // console.log(prevOutScript)
    const ourScript = prevOutScript.removeCodeSeparator().toBuffer();

    const txTmp = this.clone();

    // Handle Inputs
    // Blank other inputs completely,      SIGHASH_ANYONECANPAY
    if (fAnyOne) {
      txTmp.vin = [txTmp.vin[inIndex] as VinObj];
      txTmp.vin[0]!.script = ourScript;
    }
    // Blank only other inputs'signatures, SIGHASH_ALL
    txTmp.vin.forEach(function (input) {
      input.script = new Uint8Array(0);
    });
    txTmp.vin[inIndex]!.script = ourScript;

    // Handle Outputs
    // Blank all output, and clear others sequence,  SIGHASH_NONE
    if (fNone) {
      txTmp.vout = [];
      // ignore sequence numbers (except at inIndex)
      txTmp.vin.forEach(function (input, i) {
        if (i === inIndex) return;
        input.sequence = 0;
      });
      // Blank all other output except the same index, SIGHASH_SINGLE
    } else if (fSingle) {
      // truncate outputs after
      txTmp.vout.length = inIndex + 1;

      // "blank" outputs before
      for (let i = 0; i < inIndex; i++) {
        txTmp.vout[i] = BLANK_OUTPUT;
      }
      // ignore sequence numbers (except at inIndex)
      txTmp.vin.forEach(function (input, y) {
        if (y === inIndex) return;
        input.sequence = 0;
      });
    }

    // Serialize and Hash
    function sigHashPrefixSerializeSize(
      txIns: Array<{
        txid: Uint8Array;
        vout: number;
        sequence: number;
        script: Uint8Array;
      }>,
      txOuts: Array<{ coinId: number; amount: bigint; script: Uint8Array }>,
      inIndex: number
    ): number {
      // 1) 4 bytes version/serialization type
      // 2) number of inputs varint
      // 3) per input:
      //    a) 32 bytes prevout hash
      //    b) 4 bytes prevout index
      //    c) 1 byte prevout tree
      //    d) 4 bytes sequence
      // 4) number of outputs varint
      // 5) per output:
      //    0) 2 bytes coinId
      //    a) 8 bytes amount
      //    c) pkscript len varint (1 byte if not SigHashSingle output)
      //    d) N bytes pkscript (0 bytes if not SigHashSingle output)
      // 6) 4 bytes lock time
      // 7) 4 bytes expiry
      const nTxIns = txIns.length;
      const nTxOuts = txOuts.length;
      let size =
        4 +
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

    function sigHashWitnessSerializeSize(
      txIns: Array<{
        txid: Uint8Array;
        vout: number;
        sequence: number;
        script: Uint8Array;
      }>,
      signScript: Uint8Array
    ): number {
      // 1) 4 bytes version/serialization type
      // 2) number of inputs varint
      // 3) per input:
      //    a) prevout pkscript varint (1 byte if not input being signed)
      //    b) N bytes prevout pkscript (0 bytes if not input being signed)

      // NOTE: The prevout pkscript is replaced by nil for all inputs except
      // the input being signed.  Thus, all other inputs (aka numTxIns-1) commit
      // to a nil script which gets encoded as a single 0x00 byte.  This is
      // because encoding 0 as a varint results in 0x00 and there is no script
      // to write.  So, rather than looping through all inputs and manually
      // calculating the size per input, use (numTxIns - 1) as an
      // optimization.
      const nTxIns = txIns.length;
      const size =
        4 +
        varuint.encodingLength(nTxIns) +
        (nTxIns - 1) +
        varSliceSize(signScript);
      return size;
    }

    function writeSlice(
      buffer: Uint8Array,
      slice: Uint8Array,
      offset: number
    ): number {
      buffer.set(slice, offset);
      // const o = slice.copy(buffer, offset);
      return offset + slice.length;
    }

    function writeUInt16(
      buffer: Uint8Array,
      i: number,
      offset: number
    ): number {
      uint8arraytools.writeUInt16(buffer, offset, i, "LE");
      return offset + 2;
    }

    function writeUInt32(
      buffer: Uint8Array,
      i: number,
      offset: number
    ): number {
      uint8arraytools.writeUInt32(buffer, offset, i, "LE");
      return offset + 4;
    }

    function writeUInt64(
      buffer: Uint8Array,
      i: bigint,
      offset: number
    ): number {
      const o = utils.writeUInt64LE(buffer, Number(i), offset);
      return o;
    }

    function writeVarInt(
      buffer: Uint8Array,
      i: number,
      offset: number
    ): number {
      const buf = Buffer.from(buffer);
      varuint.encode(i, buf, offset);
      const o = varuint.encode.bytes;
      buffer.set(buf.subarray(offset, offset + o), offset);
      return offset + o;
    }

    function writeVarSlice(
      buffer: Uint8Array,
      slice: Uint8Array,
      offset: number
    ): number {
      let o = writeVarInt(buffer, slice.length, offset);
      o = writeSlice(buffer, slice, o);
      return o;
    }

    const prefixBuffer = new Uint8Array(
      sigHashPrefixSerializeSize(txTmp.vin, txTmp.vout, inIndex)
    );
    prefixBuffer.fill(0);

    // Commit to the version and hash serialization type.
    // prefix version
    let offset = 0;
    offset = writeUInt16(prefixBuffer, txTmp.version, offset);
    offset = writeUInt16(prefixBuffer, SigHashSerializePrefix, offset);
    // txIn
    offset = writeVarInt(prefixBuffer, txTmp.vin.length, offset);
    txTmp.vin.forEach(function (txIn) {
      offset = writeSlice(prefixBuffer, txIn.txid, offset);
      offset = writeUInt32(prefixBuffer, txIn.vout, offset);
      offset = writeUInt32(prefixBuffer, txIn.sequence, offset);
    });
    // txOut
    offset = writeVarInt(prefixBuffer, txTmp.vout.length, offset);
    txTmp.vout.forEach(function (txOut) {
      offset = writeUInt16(prefixBuffer, txOut.coinId, offset);
      offset = writeUInt64(prefixBuffer, txOut.amount, offset);
      offset = writeVarSlice(prefixBuffer, txOut.script, offset);
    });

    offset = writeUInt32(prefixBuffer, txTmp.locktime, offset);
    offset = writeUInt32(prefixBuffer, txTmp.exprie, offset);
    const witnessBuffer = new Uint8Array(
      sigHashWitnessSerializeSize(txTmp.vin, ourScript)
    );
    witnessBuffer.fill(0);
    offset = 0;
    // witness version
    offset = writeUInt16(witnessBuffer, txTmp.version, offset);
    offset = writeUInt16(witnessBuffer, SigHashSerializeWitness, offset);
    // txIns
    offset = writeVarInt(witnessBuffer, txTmp.vin.length, offset);
    txTmp.vin.forEach(function (txIn) {
      offset = writeVarSlice(witnessBuffer, txIn.script, offset);
    });

    // The final signature hash (message to sign) is the hash of the
    // serialization of the following fields:
    //
    // 1) the hash type (as little-endian uint32)
    // 2) prefix hash (as produced by hash function)
    // 3) witness hash (as produced by hash function)
    const typeBuffer = new Uint8Array(4);
    uint8arraytools.writeUInt32(typeBuffer, 0, hashType, "LE");
    const prefixHash = hash.blake2b256(prefixBuffer);
    const witnessHash = hash.blake2b256(witnessBuffer);
    return hash.blake2b256(
      uint8arraytools.concat([typeBuffer, prefixHash, witnessHash])
    );
  }
}

const SigHashMask = 0x1f;
const SigHashSerializePrefix = 1;
const SigHashSerializeWitness = 3;
const EMPTY_SCRIPT = new Uint8Array(0);
const BLANK_OUTPUT: VoutObj = {
  coinId: 0,
  amount: BigInt(0),
  script: EMPTY_SCRIPT,
};

function varSliceSize(someScript: Uint8Array): number {
  const length = someScript.length;

  return varuint.encodingLength(length) + length;
}
