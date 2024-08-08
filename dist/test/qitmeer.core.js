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
const mocha_1 = require("mocha");
const assert_1 = __importDefault(require("assert"));
const bs58_1 = __importDefault(require("bs58"));
const qitmeer = __importStar(require("../src"));
const uint8arraytools = __importStar(require("uint8array-tools"));
const data = require("./data/qitmeer.core/core.json");
(0, mocha_1.describe)("qitmeer-core", () => {
    (0, mocha_1.describe)("type check", function () {
        (0, mocha_1.it)("hash256", function () {
            const hexStr = "5c0dff371fe9c762139570bdfef7d34aca5e84325871e67fd0203f0da8c5e50c";
            assert_1.default.strictEqual(qitmeer.typecheck(qitmeer.types.Hex, hexStr), true);
            assert_1.default.strictEqual(qitmeer.typecheck(qitmeer.types.Hex32, hexStr), true);
            assert_1.default.strictEqual(qitmeer.typecheck(qitmeer.types.Hash256, uint8arraytools.fromHex(hexStr)), true);
        });
    });
    (0, mocha_1.describe)("base58 test", () => {
        console.log(data);
        data.base58.forEach(function (f) {
            const hexStr = f[0];
            const b58Str = f[1];
            (0, mocha_1.it)("encode " + hexStr + " -> " + b58Str, function () {
                const encoded = bs58_1.default.encode(uint8arraytools.fromHex(hexStr));
                assert_1.default.strictEqual(encoded, b58Str);
            });
            (0, mocha_1.it)("decode " + b58Str + " -> " + hexStr, function () {
                const decoded = uint8arraytools.toHex(bs58_1.default.decode(b58Str));
                assert_1.default.strictEqual(decoded, hexStr);
            });
        });
    });
    (0, mocha_1.describe)("qitmeer.hash", function () {
        data.hash.sha256.forEach(function (d) {
            const inputStr = d[0];
            const hashStr = d[1];
            (0, mocha_1.it)("sha256 " + inputStr + " -> " + hashStr, function () {
                const hash = uint8arraytools.toHex(qitmeer.hash.sha256(uint8arraytools.fromHex(inputStr)));
                assert_1.default.strictEqual(hash, hashStr);
            });
        });
        data.hash.blake2b256.forEach(function (d) {
            const inputStr = d[0];
            const hashStr = d[1];
            (0, mocha_1.it)("blake2b256 " + inputStr + " -> " + hashStr, function () {
                const hash = uint8arraytools.toHex(qitmeer.hash.blake2b256(uint8arraytools.fromHex(inputStr)));
                assert_1.default.strictEqual(hash, hashStr);
            });
        });
        data.hash.hash160.forEach(function (d) {
            const inputStr = d[0];
            const hashStr = d[1];
            (0, mocha_1.it)("hash160 " + inputStr + " -> " + hashStr, function () {
                const hash = uint8arraytools.toHex(qitmeer.hash.hash160(uint8arraytools.fromHex(inputStr)));
                assert_1.default.strictEqual(hash, hashStr);
            });
        });
    });
    (0, mocha_1.describe)("qitmeer.address", function () {
        data.base58check.forEach(function (f) {
            const hexStr = f[0];
            const qitmeer58checkStr = f[1];
            const { coin, network } = f[2];
            if (coin === "qitmeer") {
                (0, mocha_1.it)("fromBase58Check " + qitmeer58checkStr, function () {
                    const decoded = qitmeer.address.fromBase58Check(qitmeer58checkStr);
                    assert_1.default.strictEqual(uint8arraytools.toHex(decoded.hash), hexStr);
                    switch (network) {
                        case "privnet":
                            assert_1.default.strictEqual(decoded.version, qitmeer.networks.privnet.pubKeyHashAddrId);
                            break;
                        case "mainnet":
                            assert_1.default.strictEqual(decoded.version, qitmeer.networks.mainnet.pubKeyHashAddrId);
                            break;
                        case "testnet":
                            assert_1.default.strictEqual(decoded.version, qitmeer.networks.testnet.pubKeyHashAddrId);
                            break;
                        default:
                            assert_1.default.fail("unknown network " + network);
                    }
                });
                (0, mocha_1.it)("toBase58Check " + hexStr, function () {
                    let encoded;
                    switch (network) {
                        case "privnet":
                            encoded = qitmeer.address.toBase58Check(uint8arraytools.fromHex(hexStr), qitmeer.networks.privnet.pubKeyHashAddrId);
                            assert_1.default.strictEqual(encoded, qitmeer58checkStr);
                            break;
                        case "mainnet":
                            encoded = qitmeer.address.toBase58Check(uint8arraytools.fromHex(hexStr), qitmeer.networks.mainnet.pubKeyHashAddrId);
                            assert_1.default.strictEqual(encoded, qitmeer58checkStr);
                            break;
                        case "testnet":
                            encoded = qitmeer.address.toBase58Check(uint8arraytools.fromHex(hexStr), qitmeer.networks.testnet.pubKeyHashAddrId);
                            assert_1.default.strictEqual(encoded, qitmeer58checkStr);
                            break;
                        default:
                            assert_1.default.fail("unknown network " + network);
                    }
                });
            }
        });
    });
    (0, mocha_1.describe)("qitmeer.EC", function () {
        (0, mocha_1.describe)("wif compressed", function () {
            data.EC.wif.compressed.forEach(function (f) {
                const ecPrivStr = f[0];
                const wifStr = f[1];
                const ecPair = qitmeer.ec.fromWIF(wifStr);
                (0, mocha_1.it)("fromWIF " + wifStr, function () {
                    assert_1.default.strictEqual(ecPrivStr, uint8arraytools.toHex(ecPair.privateKey));
                    assert_1.default.strictEqual(true, ecPair.compressed);
                });
                (0, mocha_1.it)("toWIF " + ecPrivStr, function () {
                    const wif = ecPair.toWIF();
                    console.log(wifStr, wif);
                    assert_1.default.strictEqual(wifStr, wif);
                });
            });
        });
        (0, mocha_1.describe)("wif uncompressed", function () {
            data.EC.wif.uncompressed.forEach(function (f) {
                const ecPrivStr = f[0];
                const wifStr = f[1];
                const ecPair = qitmeer.ec.fromWIF(wifStr);
                (0, mocha_1.it)("fromWIF " + wifStr, function () {
                    assert_1.default.strictEqual(ecPrivStr, uint8arraytools.toHex(ecPair.privateKey));
                    assert_1.default.strictEqual(false, ecPair.compressed);
                });
                (0, mocha_1.it)("toWIF " + ecPrivStr, function () {
                    const wif = ecPair.toWIF();
                    assert_1.default.strictEqual(wifStr, wif);
                });
            });
        });
        (0, mocha_1.describe)("keypair compressed", function () {
            data.EC.keypair.compressed.forEach(function (f) {
                const privHex = f[0];
                const pubHex = f[1];
                (0, mocha_1.it)("fromPrivateKey " + privHex, function () {
                    const keyPair = qitmeer.ec.fromPrivateKey(uint8arraytools.fromHex(privHex));
                    assert_1.default.strictEqual(keyPair.compressed, true);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.privateKey), privHex);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.__priv), privHex);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.publicKey), pubHex);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.__pub), pubHex);
                });
                (0, mocha_1.it)("fromPubKey " + pubHex, function () {
                    const keyPair = qitmeer.ec.fromPublicKey(uint8arraytools.fromHex(pubHex));
                    assert_1.default.strictEqual(keyPair.compressed, true);
                    assert_1.default.strictEqual(keyPair.privateKey, null);
                    assert_1.default.strictEqual(keyPair.__priv, null);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.publicKey), pubHex);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.__pub), pubHex);
                });
            });
        });
        (0, mocha_1.describe)("keypair uncompressed", function () {
            data.EC.keypair.uncompressed.forEach(function (f) {
                const privHex = f[0];
                const pubHex = f[1];
                (0, mocha_1.it)("fromPrivateKey " + privHex, function () {
                    const keyPair = qitmeer.ec.fromPrivateKey(uint8arraytools.fromHex(privHex), {
                        compressed: false,
                    });
                    assert_1.default.strictEqual(keyPair.compressed, false);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.privateKey), privHex);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.__priv), privHex);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.publicKey), pubHex);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.__pub), pubHex);
                });
                (0, mocha_1.it)("fromPubKey " + pubHex, function () {
                    const keyPair = qitmeer.ec.fromPublicKey(uint8arraytools.fromHex(pubHex), {
                        compressed: false,
                    });
                    assert_1.default.strictEqual(keyPair.compressed, false);
                    assert_1.default.strictEqual(keyPair.privateKey, null);
                    assert_1.default.strictEqual(keyPair.__priv, null);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.publicKey), pubHex);
                    assert_1.default.strictEqual(uint8arraytools.toHex(keyPair.__pub), pubHex);
                });
            });
        });
        (0, mocha_1.describe)("random", function () {
            (0, mocha_1.it)("fromEntropy", function () {
                var _a;
                const keyPair = qitmeer.ec.fromEntropy();
                assert_1.default.strictEqual(true, keyPair.compressed);
                assert_1.default.strictEqual(32, (_a = keyPair.privateKey) === null || _a === void 0 ? void 0 : _a.length);
                assert_1.default.strictEqual(33, keyPair.publicKey.length);
                (0, assert_1.default)(keyPair.publicKey[0] === 0x03 || keyPair.publicKey[0] === 0x02);
                const keyPair2 = qitmeer.ec.fromPrivateKey(keyPair.privateKey);
                assert_1.default.deepStrictEqual(keyPair2.publicKey, keyPair.publicKey);
            });
        });
        (0, mocha_1.describe)("signature", function () {
            (0, mocha_1.it)("sign", function () {
                const ecPair = qitmeer.ec.fromWIF("L1g6Qv9Q7H6mraoqLQ4r4pH4up2qfVqzx6y48AoUw1zkke9BnR1F");
                const signature = ecPair.sign(uint8arraytools.fromHex("31d336c0f0fa39bd83e1349549befa279a4e3cf6da3bfcf77578ba078b99476d"));
                assert_1.default.strictEqual("a62d560012f8a3714b8c85c4282c7498b5490ea8a7e4ab5b392834264574d9d41b445cabb744c6aeeececfcc92cf2effaf2ac177a55cfd6071e41bf45eeb4454", uint8arraytools.toHex(signature));
            });
            (0, mocha_1.it)("verify", function () {
                const ecPair = qitmeer.ec.fromWIF("L1g6Qv9Q7H6mraoqLQ4r4pH4up2qfVqzx6y48AoUw1zkke9BnR1F");
                const result = ecPair.verify(uint8arraytools.fromHex("31d336c0f0fa39bd83e1349549befa279a4e3cf6da3bfcf77578ba078b99476d"), uint8arraytools.fromHex("a62d560012f8a3714b8c85c4282c7498b5490ea8a7e4ab5b392834264574d9d41b445cabb744c6aeeececfcc92cf2effaf2ac177a55cfd6071e41bf45eeb4454"));
                assert_1.default.strictEqual(true, result);
            });
        });
    });
    (0, mocha_1.describe)("qitmeer.Transaction", function () {
        (0, mocha_1.describe)("nowitness", function () {
            (0, mocha_1.it)("fromBuffer", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.nowitness.hex));
                assert_1.default.strictEqual(tx.version, data.TX.nowitness.tx.version);
                assert_1.default.strictEqual(tx.vin.length, data.TX.nowitness.tx.vin.length);
                tx.vin.forEach(function (vin, index) {
                    assert_1.default.strictEqual(uint8arraytools.toHex(vin.txid.reverse()), data.TX.nowitness.tx.vin[index].txid);
                    assert_1.default.strictEqual(vin.vout, data.TX.nowitness.tx.vin[index].vout);
                    assert_1.default.strictEqual(vin.sequence, data.TX.nowitness.tx.vin[index].sequence);
                    assert_1.default.deepStrictEqual(vin.script, uint8arraytools.fromHex(data.TX.nowitness.tx.vin[index].scriptSig.hex));
                });
                assert_1.default.strictEqual(tx.vout.length, data.TX.nowitness.tx.vout.length);
                tx.vout.forEach(function (vout, index) {
                    assert_1.default.strictEqual(Number(vout.amount), Number(data.TX.nowitness.tx.vout[index].amount));
                    assert_1.default.deepStrictEqual(vout.script, uint8arraytools.fromHex(data.TX.nowitness.tx.vout[index].scriptPubKey.hex));
                });
                assert_1.default.strictEqual(tx.locktime, data.TX.nowitness.tx.locktime);
                assert_1.default.strictEqual(tx.exprie, data.TX.nowitness.tx.expire);
            });
            (0, mocha_1.it)("byteLength", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.nowitness.hex));
                assert_1.default.strictEqual(tx.byteLength(), uint8arraytools.fromHex(data.TX.nowitness.hex).length);
            });
            (0, mocha_1.it)("getTxHash", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.nowitness.hex));
                assert_1.default.deepStrictEqual(tx.toBuffer(), uint8arraytools.fromHex(data.TX.nowitness.hex), "nowitness");
                assert_1.default.deepStrictEqual(tx.getTxIdBuffer().reverse(), uint8arraytools.fromHex(data.TX.nowitness.tx.txid));
            });
            (0, mocha_1.it)("getTxId " + data.TX.nowitness.tx.txid, function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.nowitness.hex));
                assert_1.default.strictEqual(tx.getTxId(), data.TX.nowitness.tx.txid);
            });
            (0, mocha_1.it)("clone", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.nowitness.hex));
                const txClone = tx.clone();
                assert_1.default.strictEqual(tx.version, txClone.version);
                assert_1.default.strictEqual(tx.vin.length, txClone.vin.length);
                tx.vin.forEach(function (vin, index) {
                    assert_1.default.strictEqual(vin.txid, txClone.vin[index].txid);
                    assert_1.default.strictEqual(vin.vout, txClone.vin[index].vout);
                    assert_1.default.strictEqual(vin.sequence, txClone.vin[index].sequence);
                    assert_1.default.deepStrictEqual(vin.script, txClone.vin[index].script);
                });
                assert_1.default.strictEqual(tx.vout.length, txClone.vout.length);
                tx.vout.forEach(function (vout, index) {
                    assert_1.default.strictEqual(vout.amount, txClone.vout[index].amount);
                    assert_1.default.deepStrictEqual(vout.script, txClone.vout[index].script);
                });
                assert_1.default.strictEqual(tx.locktime, txClone.locktime);
                assert_1.default.strictEqual(tx.exprie, txClone.exprie);
                assert_1.default.deepStrictEqual(tx.getTxHash(), txClone.getTxHash());
                assert_1.default.strictEqual(tx.getTxId(), txClone.getTxId());
                assert_1.default.deepStrictEqual(tx.getTxIdBuffer(), txClone.getTxIdBuffer());
                assert_1.default.deepStrictEqual(tx.getTxHashBuffer(), txClone.getTxHashBuffer());
            });
        });
        (0, mocha_1.describe)("full witness", function () {
            (0, mocha_1.it)("fromBuffer", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.witness.hex));
                assert_1.default.strictEqual(tx.version, data.TX.witness.tx.version);
                assert_1.default.strictEqual(tx.vin.length, data.TX.witness.tx.vin.length);
                tx.vin.forEach(function (vin, index) {
                    assert_1.default.strictEqual(uint8arraytools.toHex(vin.txid.reverse()), data.TX.witness.tx.vin[index].txid);
                    assert_1.default.strictEqual(vin.vout, data.TX.witness.tx.vin[index].vout);
                    assert_1.default.strictEqual(vin.sequence, data.TX.witness.tx.vin[index].sequence);
                    assert_1.default.deepStrictEqual(vin.script, uint8arraytools.fromHex(data.TX.witness.tx.vin[index].scriptSig.hex));
                    assert_1.default.strictEqual(107, vin.script.length);
                });
                assert_1.default.strictEqual(tx.vout.length, data.TX.witness.tx.vout.length);
                tx.vout.forEach(function (vout, index) {
                    assert_1.default.strictEqual(Number(vout.amount), Number(data.TX.witness.tx.vout[index].amount));
                    assert_1.default.deepStrictEqual(vout.script, uint8arraytools.fromHex(data.TX.witness.tx.vout[index].scriptPubKey.hex));
                    assert_1.default.strictEqual(25, vout.script.length);
                    assert_1.default.strictEqual(25, uint8arraytools.fromHex(data.TX.witness.tx.vout[index].scriptPubKey.hex).length);
                });
                assert_1.default.strictEqual(tx.locktime, data.TX.witness.tx.locktime);
                assert_1.default.strictEqual(tx.exprie, data.TX.witness.tx.expire);
                assert_1.default.strictEqual(tx.timestamp, data.TX.witness.tx.timestamp);
            });
            (0, mocha_1.it)("byteLength", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.witness.hex));
                assert_1.default.strictEqual(tx.byteLength(), uint8arraytools.fromHex(data.TX.witness.hex).length);
            });
            (0, mocha_1.it)("getHash", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.witness.hex));
                assert_1.default.deepStrictEqual(tx.toBuffer(undefined, undefined, qitmeer.Transaction.TxSerializeFull), uint8arraytools.fromHex(data.TX.witness.hex));
                assert_1.default.deepStrictEqual(tx.getTxIdBuffer().reverse(), uint8arraytools.fromHex(data.TX.witness.tx.txid));
            });
            (0, mocha_1.it)("getTxId " + data.TX.witness.tx.txid, function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.witness.hex));
                assert_1.default.strictEqual(tx.getTxId(), data.TX.witness.tx.txid);
            });
            (0, mocha_1.it)("getTxIdBuffer", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.witness.hex));
                assert_1.default.deepStrictEqual(tx.getTxIdBuffer().reverse(), uint8arraytools.fromHex(data.TX.witness.tx.txid));
            });
            (0, mocha_1.it)("getTxHashBuffer" + data.TX.witness.tx.txhash, function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.witness.hex));
                assert_1.default.deepStrictEqual(tx.getTxHashBuffer().reverse(), uint8arraytools.fromHex(data.TX.witness.tx.txhash));
            });
            (0, mocha_1.it)("clone", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.witness.hex));
                const txClone = tx.clone();
                assert_1.default.strictEqual(tx.version, txClone.version);
                assert_1.default.strictEqual(tx.vin.length, txClone.vin.length);
                tx.vin.forEach(function (vin, index) {
                    assert_1.default.strictEqual(vin.txid, txClone.vin[index].txid);
                    assert_1.default.strictEqual(vin.vout, txClone.vin[index].vout);
                    assert_1.default.strictEqual(vin.sequence, txClone.vin[index].sequence);
                    assert_1.default.deepStrictEqual(vin.script, txClone.vin[index].script);
                });
                assert_1.default.strictEqual(tx.vout.length, txClone.vout.length);
                tx.vout.forEach(function (vout, index) {
                    assert_1.default.strictEqual(vout.amount, txClone.vout[index].amount);
                    assert_1.default.deepStrictEqual(vout.script, txClone.vout[index].script);
                });
                assert_1.default.strictEqual(tx.locktime, txClone.locktime);
                assert_1.default.strictEqual(tx.exprie, txClone.exprie);
                assert_1.default.deepStrictEqual(tx.getTxHash(), txClone.getTxHash());
                assert_1.default.strictEqual(tx.getTxId(), txClone.getTxId());
                assert_1.default.deepStrictEqual(tx.getTxIdBuffer(), txClone.getTxIdBuffer());
                assert_1.default.deepStrictEqual(tx.getTxHashBuffer(), txClone.getTxHashBuffer());
            });
        });
        (0, mocha_1.describe)("two inputs", function () {
            (0, mocha_1.it)("fromBuffer/toBuffer", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.TX.twoinputs.hex));
                assert_1.default.strictEqual(tx.vin.length, data.TX.twoinputs.vin.length);
                assert_1.default.strictEqual(uint8arraytools.toHex(tx.toBuffer()), data.TX.twoinputs.hex);
            });
        });
        (0, mocha_1.describe)("signhash", function () {
            (0, mocha_1.it)("hashForSignature, throw invalid index", function () {
                const tx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(data.SignHashTest[0].txHex));
                const preScript = qitmeer.script.fromBuffer(uint8arraytools.fromHex(data.SignHashTest[0].prvScriptHex));
                assert_1.default.throws(function () {
                    tx.hashForSignature(1, preScript, qitmeer.Transaction.SIGHASH_ALL);
                }, /^Error: invalid input index 1, out of the range of tx input 1$/);
            });
            data.SignHashTest.forEach(function (f) {
                (0, mocha_1.it)("hashForSignature " + f.signHash, function () {
                    const mytx = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(f.txHex));
                    assert_1.default.strictEqual(mytx.getTxId(), f.txId);
                    const preScript = qitmeer.script.fromBuffer(uint8arraytools.fromHex(f.prvScriptHex));
                    assert_1.default.strictEqual(preScript === null || preScript === void 0 ? void 0 : preScript.toAsm(), f.prvScriptAsm);
                    const signHash = mytx.hashForSignature(0, preScript, qitmeer.Transaction.SIGHASH_ALL);
                    assert_1.default.deepStrictEqual(signHash, uint8arraytools.fromHex(f.signHash));
                });
            });
        });
    });
    (0, mocha_1.describe)("qitmeer.block", function () {
        (0, mocha_1.describe)("test block", function () {
            (0, mocha_1.it)("fromBuffer", function () {
                const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.Block.hex));
                assert_1.default.strictEqual(block.version, data.Block.json.version);
                assert_1.default.strictEqual(uint8arraytools.toHex(block.parentRoot.reverse()), data.Block.json.parentroot);
                assert_1.default.strictEqual(uint8arraytools.toHex(block.txRoot.reverse()), data.Block.json.txRoot);
                assert_1.default.strictEqual(uint8arraytools.toHex(block.stateRoot.reverse()), data.Block.json.stateRoot);
                assert_1.default.strictEqual(block.difficulty, data.Block.json.difficulty);
                assert_1.default.strictEqual(new Date(block.timestamp) * 1000, new Date(data.Block.json.timestamp) * 1000);
                assert_1.default.strictEqual(block.pow.nonce, data.Block.json.pow.nonce);
                assert_1.default.strictEqual(block.pow.pow_type, data.Block.json.pow.pow_type);
                assert_1.default.strictEqual(block.pow.proof_data.edge_bits, data.Block.json.pow.proof_data.edge_bits);
                assert_1.default.strictEqual(uint8arraytools.toHex(block.pow.proof_data.circle_nonces), data.Block.json.pow.proof_data.circle_nonces);
                assert_1.default.strictEqual(block.transactions.length, data.Block.json.transactions.length);
                block.transactions.forEach(function (tx, index) {
                    assert_1.default.strictEqual(tx.version, data.Block.json.transactions[index].version);
                    assert_1.default.strictEqual(tx.vin.length, data.Block.json.transactions[index].vin.length);
                    tx.vin.forEach(function (vin, i) {
                        assert_1.default.strictEqual(vin.sequence, data.Block.json.transactions[index].vin[i].sequence);
                    });
                    assert_1.default.strictEqual(tx.vout.length, data.Block.json.transactions[index].vout.length);
                    assert_1.default.strictEqual(tx.locktime, data.Block.json.transactions[index].locktime);
                    assert_1.default.strictEqual(tx.exprie, data.Block.json.transactions[index].expire);
                    assert_1.default.strictEqual(tx.byteLength(), uint8arraytools.fromHex(data.Block.json.transactions[index].hex)
                        .length);
                });
            });
            (0, mocha_1.it)("byteLength", function () {
                const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.Block.hex));
                assert_1.default.strictEqual(block.byteLength(false), uint8arraytools.fromHex(data.Block.hex).length);
            });
            (0, mocha_1.it)("toBuffer headeronly", function () {
                const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.Block.hex));
                assert_1.default.deepStrictEqual(block.toBuffer(true), uint8arraytools.fromHex(data.BlockHeader.hex));
            });
            (0, mocha_1.it)("toBuffer full", function () {
                const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.Block.hex));
                assert_1.default.deepStrictEqual(block.toBuffer(false), uint8arraytools.fromHex(data.Block.hex));
            });
            (0, mocha_1.it)("getHashBuffer", function () {
                const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.Block.hex));
                assert_1.default.deepStrictEqual(block.getHashBuffer(), uint8arraytools.fromHex(data.Block.json.hash).reverse());
            });
            (0, mocha_1.it)("getHash " + data.Block.json.hash, function () {
                const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.Block.hex));
                assert_1.default.strictEqual(block.getHash(), data.Block.json.hash);
            });
        });
        (0, mocha_1.describe)("tx in block", function () {
            const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.Block.hex));
            block.transactions.forEach(function (tx, index) {
                const txid = data.Block.json.transactions[index].txid;
                (0, mocha_1.it)("txid " + txid, function () {
                    assert_1.default.strictEqual(tx.getTxId(), txid);
                });
                const fullhash = data.Block.json.transactions[index].txhash;
                (0, mocha_1.it)("txhash " + fullhash, function () {
                    assert_1.default.strictEqual(tx.getTxHash(), fullhash);
                });
            });
        });
        (0, mocha_1.describe)("txRoot", function () {
            (0, mocha_1.it)("calculate txRoot, single tx", function () {
                const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.Block.hex));
                const singleTxInBlock = block.transactions;
                assert_1.default.strictEqual(1, singleTxInBlock.length);
                assert_1.default.deepStrictEqual(qitmeer.block.calculateTxRoot(singleTxInBlock), uint8arraytools.fromHex(data.Block.json.txRoot).reverse());
            });
            (0, mocha_1.it)("calculate txRoot, multi tx", function () {
                const block = qitmeer.block.fromBuffer(uint8arraytools.fromHex(data.BlockMultipleTx.hex));
                const txInBlock = block.transactions;
                assert_1.default.strictEqual(2, txInBlock.length);
                txInBlock.forEach(function (tx, i) {
                    assert_1.default.strictEqual(tx.getTxId(), data.BlockMultipleTx.json.transactions[i].txid);
                    assert_1.default.strictEqual(tx.getTxHash(), data.BlockMultipleTx.json.transactions[i].txhash);
                });
                assert_1.default.deepStrictEqual(qitmeer.block.calculateTxRoot(txInBlock), uint8arraytools.fromHex(data.BlockMultipleTx.json.txRoot).reverse());
            });
        });
        (0, mocha_1.describe)("ops", function () {
            (0, mocha_1.it)("test OP_CHECKSIG", function () {
                assert_1.default.strictEqual(qitmeer.OPS_MAP[qitmeer.OPS.OP_CHECKSIG], "OP_CHECKSIG");
                assert_1.default.strictEqual(qitmeer.OPS.OP_CHECKSIG, 172);
            });
        });
    });
    (0, mocha_1.describe)("qitmeer script", function () {
        (0, mocha_1.describe)("fromBuffer ", function () {
            data.ScriptTest.forEach(function (f) {
                const script = qitmeer.script.fromBuffer(uint8arraytools.fromHex(f.hex));
                (0, mocha_1.it)("test script toAsm " + f.asm, function () {
                    assert_1.default.strictEqual(f.asm, script === null || script === void 0 ? void 0 : script.toAsm());
                });
                (0, mocha_1.it)("test script toBuffer " + f.hex, function () {
                    assert_1.default.deepStrictEqual(uint8arraytools.fromHex(f.hex), script === null || script === void 0 ? void 0 : script.toBuffer());
                });
            });
        });
        (0, mocha_1.describe)("fromAsm ", function () {
            data.ScriptTest.forEach(function (f) {
                const script = qitmeer.script.fromAsm(f.asm);
                (0, mocha_1.it)("test script toAsm " + f.asm, function () {
                    assert_1.default.strictEqual(f.asm, script.toAsm());
                });
                (0, mocha_1.it)("test script toBuffer " + f.hex, function () {
                    assert_1.default.deepStrictEqual(uint8arraytools.fromHex(f.hex), script.toBuffer());
                });
            });
        });
        (0, mocha_1.describe)("removeCodeSeparator ", function () {
            data.ScriptRemoveTest.forEach(function (f) {
                (0, mocha_1.it)("test script " + f.before.hex + "->" + f.after.hex, function () {
                    const script = qitmeer.script.fromAsm(f.before.asm);
                    assert_1.default.strictEqual(f.before.asm, script.toAsm());
                    assert_1.default.strictEqual(script.removeCodeSeparator().toAsm(), f.after.asm);
                    assert_1.default.strictEqual(uint8arraytools.toHex(script.removeCodeSeparator().toBuffer()), f.after.hex);
                });
            });
        });
    });
    (0, mocha_1.describe)("example", function () {
        (0, mocha_1.it)("sign a raw transaction", function () {
            const alex = qitmeer.ec.fromWIF("L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC");
            const txsnr = qitmeer.TxSigner.newSigner(qitmeer.networks.privnet);
            txsnr.setVersion(1);
            txsnr.addInput("5c0dff371fe9c762139570bdfef7d34aca5e84325871e67fd0203f0da8c5e50c", 2);
            txsnr.addOutput("RmFskNPMcPLn4KpDqYzkgwBoa5soPS2SDDH", 44000000000);
            txsnr.addOutput("RmQNkCr8ehRUzJhmNmgQVByv7VjakuCjc3d", 990000000);
            txsnr.sign(0, alex);
            const rawTx = txsnr.build().toBuffer();
            assert_1.default.strictEqual(uint8arraytools.toHex(rawTx), "01000000010ce5c5a80d3f20d07fe6715832845eca4ad3f7febd70951362c7e91f37ff0d5c02000000ffffffff02000000b89a3e0a0000001976a91469570a6c1fcb68db1b1c50b34960e714d42c7b9c88ac00008033023b000000001976a914c693f8fbfe6836f1fb55579b427cfc4fd201495388ac000000000000000000000000016a4730440220438749b5e955d06da90cdd7c9ec4191e11994022b20cd541376019315ca130c3022035792747edcc60bcd60bf109ef8181f9929aed68139c2348c68333ec36a65d25012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd174");
        });
        (0, mocha_1.it)("two inputs of alex", function () {
            const alex = qitmeer.ec.fromWIF("L2QvAGZrNTdJSjzMSEA15vXkbjzdhn7fBJrcWHv3sprLFhkHXksC");
            const txsnr = qitmeer.TxSigner.newSigner(qitmeer.networks.privnet);
            txsnr.setVersion(1);
            txsnr.addInput("d46a58fced5a05b1dc1f4450e1bdf09696291348a7eccec069ed59343ec35b4d", 2);
            txsnr.addInput("46a6d3d9e1ef552dc9b0eba147ea97e481654a2bccf59fd764652971cb4d9fdd", 2);
            txsnr.addOutput("RmFskNPMcPLn4KpDqYzkgwBoa5soPS2SDDH", 89000000000);
            txsnr.addOutput("RmQNkCr8ehRUzJhmNmgQVByv7VjakuCjc3d", 990000000);
            txsnr.sign(0, alex);
            txsnr.sign(1, alex);
            const rawTx = txsnr.build();
            assert_1.default.deepStrictEqual(rawTx.toBuffer(), uint8arraytools.fromHex("01000000024d5bc33e3459ed69c0ceeca74813299696f0bde150441fdcb1055aedfc586ad402000000ffffffffdd9f4dcb71296564d79ff5cc2b4a6581e497ea47a1ebb0c92d55efe1d9d3a64602000000ffffffff020000003ad0b8140000001976a91469570a6c1fcb68db1b1c50b34960e714d42c7b9c88ac00008033023b000000001976a914c693f8fbfe6836f1fb55579b427cfc4fd201495388ac000000000000000000000000026b483045022100ed8567dedbc1320c7c60f4097182cbe4cd877c4223f5acd9884d80f5174e9e500220483e91a1506782277023c4eeb72c3585b787b1f619e0d7c5908159d39eb5ba44012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd1746a473044022017b7edfcc331a5df26ccc3f7db557798304ca9a7e4a03d678d0fe88a97b2ef79022043d57a371bbcace977a53016ba9640fcdb88b322ebdef5a9f819172b1b395306012102abb13cd5260d3e9f8bc3db8687147ace7b6e5b63b061afe37d09a8e4550cd174"));
        });
        (0, mocha_1.it)("issues 17 verify txId", function () {
            const txHex = "01000000013f4c8c3c1726e6d813071ae4eb9ffec97d0350342a70a316f500b3873a834ddb02000000ffffffff01000000b89a3e0a0000001976a91469570a6c1fcb68db1b1c50b34960e714d42c7b9c88ac00000000000000003d7cf7600100";
            const txId = qitmeer.Transaction.fromBuffer(uint8arraytools.fromHex(txHex)).getTxId();
            assert_1.default.strictEqual(txId, "1f26b9431ebef7c70418653cf58fd7d6b0db294c6445f2edc8c69f5e6680c556");
        });
    });
});
//# sourceMappingURL=qitmeer.core.js.map