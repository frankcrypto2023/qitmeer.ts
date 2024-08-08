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
exports.fromEntropy = fromEntropy;
exports.fromPrivateKey = fromPrivateKey;
exports.fromPublicKey = fromPublicKey;
exports.fromWIF = fromWIF;
const secp256k1 = __importStar(require("tiny-secp256k1"));
const randomBytes = require("randombytes");
const wif = __importStar(require("./wif"));
const networks_1 = require("./networks");
class EC {
    constructor(priv, pub, options = {}) {
        this.compressed =
            options.compressed === undefined ? true : options.compressed;
        this.network = options.network || networks_1.networks.privnet;
        this.__priv = priv || null;
        this.__pub = null;
        if (pub)
            this.__pub = Uint8Array.from(secp256k1.pointCompress(pub, this.compressed));
    }
    get privateKey() {
        return this.__priv;
    }
    get publicKey() {
        if (!this.__pub)
            this.__pub = Uint8Array.from(secp256k1.pointFromScalar(this.__priv, this.compressed));
        return this.__pub;
    }
    toWIF() {
        if (!this.__priv)
            throw new Error("Missing private key");
        return wif.encode(this.__priv, this.compressed);
    }
    sign(hash) {
        if (!this.__priv)
            throw new Error("Missing private key");
        return Uint8Array.from(secp256k1.sign(hash, this.__priv));
    }
    verify(hash, signature) {
        return secp256k1.verify(hash, this.publicKey, signature);
    }
}
function fromEntropy(options = {}) {
    const rng = options.rng || randomBytes;
    let x;
    do {
        x = rng(32);
    } while (!secp256k1.isPrivate(x));
    return fromPrivateKey(x, options);
}
function fromPrivateKey(buffer, options = {}) {
    if (!secp256k1.isPrivate(buffer))
        throw new TypeError("Private key not in range [1, n)");
    return new EC(buffer, null, options);
}
function fromPublicKey(buffer, options = {}) {
    return new EC(null, buffer, options);
}
function fromWIF(string) {
    const decoded = wif.decode(string);
    return fromPrivateKey(decoded.privateKey, {
        compressed: decoded.compressed,
    });
}
//# sourceMappingURL=ec.js.map