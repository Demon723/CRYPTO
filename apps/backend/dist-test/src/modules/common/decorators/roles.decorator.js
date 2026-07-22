"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllowAnonymous = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
const AllowAnonymous = () => (0, common_1.SetMetadata)('allowAnonymous', true);
exports.AllowAnonymous = AllowAnonymous;
//# sourceMappingURL=roles.decorator.js.map