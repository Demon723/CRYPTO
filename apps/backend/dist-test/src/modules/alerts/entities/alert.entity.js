"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.AlertStatus = exports.AlertType = void 0;
var AlertType;
(function (AlertType) {
    AlertType["PRICE"] = "PRICE";
    AlertType["WHALE_ACTIVITY"] = "WHALE_ACTIVITY";
    AlertType["LARGE_TRANSFER"] = "LARGE_TRANSFER";
    AlertType["RISK"] = "RISK";
    AlertType["SECURITY"] = "SECURITY";
    AlertType["BRIDGE"] = "BRIDGE";
    AlertType["GOVERNANCE"] = "GOVERNANCE";
    AlertType["STAKING"] = "STAKING";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["ACTIVE"] = "ACTIVE";
    AlertStatus["PAUSED"] = "PAUSED";
    AlertStatus["TRIGGERED"] = "TRIGGERED";
    AlertStatus["DISABLED"] = "DISABLED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ALERT"] = "ALERT";
    NotificationType["SYSTEM"] = "SYSTEM";
    NotificationType["SOCIAL"] = "SOCIAL";
    NotificationType["MARKETING"] = "MARKETING";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
//# sourceMappingURL=alert.entity.js.map