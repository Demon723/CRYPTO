"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256 = sha256;
exports.sha256x2 = sha256x2;
exports.hash160 = hash160;
exports.hash256 = hash256;
exports.ripemd160 = ripemd160;
exports.hmacSha512 = hmacSha512;
exports.taggedHash = taggedHash;
const crypto_1 = require("crypto");
function sha256(data) {
    return Buffer.from((0, crypto_1.createHash)('sha256').update(data).digest());
}
function sha256x2(data) {
    return sha256(sha256(data));
}
function hash160(data) {
    return Buffer.from((0, crypto_1.createHash)('ripemd160').update(sha256(data)).digest());
}
function hash256(data) {
    return sha256(sha256(data));
}
function ripemd160(data) {
    return Buffer.from((0, crypto_1.createHash)('ripemd160').update(data).digest());
}
function hmacSha512(key, data) {
    const hmac = (0, crypto_1.createHmac)('sha512', typeof key === 'string' ? key : Buffer.from(key));
    hmac.update(data);
    return Buffer.from(hmac.digest());
}
function taggedHash(tag, data) {
    const tagHash = sha256(Buffer.from(tag));
    const tagged = Buffer.concat([tagHash, tagHash, Buffer.from(data)]);
    return sha256(tagged);
}
