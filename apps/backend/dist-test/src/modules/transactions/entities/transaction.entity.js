"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionStatus = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["TRANSFER"] = "TRANSFER";
    TransactionType["SWAP"] = "SWAP";
    TransactionType["STAKE"] = "STAKE";
    TransactionType["UNSTAKE"] = "UNSTAKE";
    TransactionType["MINT"] = "MINT";
    TransactionType["BURN"] = "BURN";
    TransactionType["APPROVE"] = "APPROVE";
    TransactionType["CONTRACT_CALL"] = "CONTRACT_CALL";
    TransactionType["BRIDGE"] = "BRIDGE";
    TransactionType["NFT_TRANSFER"] = "NFT_TRANSFER";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["CONFIRMED"] = "CONFIRMED";
    TransactionStatus["FAILED"] = "FAILED";
    TransactionStatus["DROPPED"] = "DROPPED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
//# sourceMappingURL=transaction.entity.js.map