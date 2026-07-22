"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletType = exports.Chain = void 0;
var Chain;
(function (Chain) {
    Chain["ETHEREUM"] = "ETHEREUM";
    Chain["POLYGON"] = "POLYGON";
    Chain["BSC"] = "BSC";
    Chain["ARBITRUM"] = "ARBITRUM";
    Chain["BASE"] = "BASE";
    Chain["AVALANCHE"] = "AVALANCHE";
    Chain["LXON"] = "LXON";
})(Chain || (exports.Chain = Chain = {}));
var WalletType;
(function (WalletType) {
    WalletType["EOA"] = "EOA";
    WalletType["SMART_CONTRACT"] = "SMART_CONTRACT";
    WalletType["MULTISIG"] = "MULTISIG";
})(WalletType || (exports.WalletType = WalletType = {}));
//# sourceMappingURL=wallet.entity.js.map