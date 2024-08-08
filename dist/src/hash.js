"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.dsha256 = dsha256;
exports.ripemd160 = ripemd160;
exports.bitcoin160 = bitcoin160;
exports.blake2b256 = blake2b256;
exports.blake2b512 = blake2b512;
exports.hash160 = hash160;
exports.dblake2b256 = dblake2b256;
const sha256_1 = require("@noble/hashes/sha256");
const ripemd160_1 = require("@noble/hashes/ripemd160");
const blake2b_1 = require("@noble/hashes/blake2b");
function ripemd160(buffer) {
    return (0, ripemd160_1.ripemd160)(buffer);
}
function sha256(buffer) {
    return (0, sha256_1.sha256)(buffer);
}
function bitcoin160(buffer) {
    return ripemd160(sha256(buffer));
}
function dsha256(buffer) {
    return sha256(sha256(buffer));
}
function blake2b256(buffer) {
    return (0, blake2b_1.blake2b)(buffer, { dkLen: 32 });
}
function blake2b512(buffer) {
    return (0, blake2b_1.blake2b)(buffer, { dkLen: 64 });
}
function hash160(buffer) {
    return ripemd160(blake2b256(buffer));
}
function dblake2b256(buffer) {
    return blake2b256(blake2b256(buffer));
}
//# sourceMappingURL=hash.js.map