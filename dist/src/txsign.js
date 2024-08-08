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
const transaction_1 = __importDefault(require("./transaction"));
const types_1 = __importDefault(require("./types"));
const typecheck_1 = __importDefault(require("./typecheck"));
const script_1 = __importDefault(require("./script"));
const addr = __importStar(require("./address"));
const crypto = __importStar(require("./hash"));
const Signature = __importStar(require("./signature"));
const uint8arraytools = __importStar(require("uint8array-tools"));
class TxSigner {
    constructor(network) {
        this.__inputs = [];
        this.__network = network;
        this.__tx = new transaction_1.default();
    }
    static newSigner(network) {
        return new TxSigner(network);
    }
    setLockTime(locktime) {
        (0, typecheck_1.default)(types_1.default.UInt32, locktime);
        if (this.__inputs.some((input) => { var _a; return (_a = input.signatures) === null || _a === void 0 ? void 0 : _a.some((s) => s); })) {
            throw new Error("No, this would invalidate signatures");
        }
        this.__tx.locktime = locktime;
    }
    setVersion(version) {
        (0, typecheck_1.default)(types_1.default.UInt32, version);
        this.__tx.version = version;
    }
    setTimestamp(timestamp) {
        (0, typecheck_1.default)(types_1.default.UInt32, timestamp);
        this.__tx.timestamp = timestamp;
    }
    addInput(txHash, vout, options = {}) {
        (0, typecheck_1.default)(types_1.default.Hex32, txHash);
        (0, typecheck_1.default)(types_1.default.UInt32, vout);
        const hash = uint8arraytools.fromHex(txHash).reverse();
        const prevOutId = `${txHash}:${vout}`;
        if (this.__inputs.some((input) => input._prevOutId === prevOutId)) {
            throw new Error("Duplicate TxOut: " + prevOutId);
        }
        this.__inputs.push({
            _prevOutId: prevOutId,
            prevOutTx: txHash,
            prevOutIndex: vout,
            prevOutType: options.prevOutType || script_1.default.types.P2PKH,
            prevOutScript: options.prevOutScript,
            lockTime: options.lockTime || 0,
            signatures: undefined,
            input: new script_1.default(),
        });
        this.__tx.addInput(hash, vout, options.sequence, uint8arraytools.fromHex("0x"));
    }
    addOutput(address, amount, coinId) {
        (0, typecheck_1.default)(types_1.default.Base58, address);
        (0, typecheck_1.default)(types_1.default.Amount, amount);
        const scriptPubKey = addr
            .toOutputScript(address, this.__network)
            .toBuffer();
        this.__tx.addOutput(scriptPubKey, BigInt(amount), coinId);
    }
    sign(vin, keyPair, hashType) {
        const input = this.__inputs[vin];
        if (!input) {
            throw new Error("No input at index: " + vin);
        }
        hashType = hashType || transaction_1.default.SIGHASH_ALL;
        const ourPubKey = keyPair.publicKey || keyPair.getPublicKey();
        if (!input.prevOutScript) {
            const hash = crypto.hash160(ourPubKey);
            input.prevOutScript =
                input.lockTime > 0
                    ? script_1.default.Output.CLTV(hash, input.lockTime)
                    : script_1.default.Output.P2PKH(hash);
        }
        const signHash = this.__tx.hashForSignature(vin, input.prevOutScript, hashType);
        const signature = keyPair.sign(signHash);
        input.signature = Signature.encode(signature, hashType);
        input.pubkey = ourPubKey;
    }
    build() {
        const tx = this.__tx.clone();
        this.__inputs.forEach((input, i) => {
            tx.setInputScript(i, script_1.default.Input.P2PKH(input.signature, input.pubkey).toBuffer());
        });
        return tx;
    }
    getTxId() {
        return this.__tx.getTxId();
    }
}
exports.default = TxSigner;
//# sourceMappingURL=txsign.js.map