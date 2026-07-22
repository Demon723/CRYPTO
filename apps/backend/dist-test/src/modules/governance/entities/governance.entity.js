"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalStatus = exports.VoteChoice = void 0;
var enums_1 = require("../../../../common/enums");
Object.defineProperty(exports, "VoteChoice", { enumerable: true, get: function () { return enums_1.VoteChoice; } });
var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["ACTIVE"] = "ACTIVE";
    ProposalStatus["SUCCEEDED"] = "SUCCEEDED";
    ProposalStatus["DEFEATED"] = "DEFEATED";
    ProposalStatus["PENDING"] = "PENDING";
    ProposalStatus["CANCELED"] = "CANCELED";
    ProposalStatus["QUEUED"] = "QUEUED";
    ProposalStatus["EXECUTED"] = "EXECUTED";
    ProposalStatus["EXPIRED"] = "EXPIRED";
})(ProposalStatus || (exports.ProposalStatus = ProposalStatus = {}));
//# sourceMappingURL=governance.entity.js.map