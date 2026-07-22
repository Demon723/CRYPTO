"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUserId = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!data) {
        return user;
    }
    return data ? user?.[data] : user;
});
exports.CurrentUserId = (0, common_1.createParamDecorator)((_, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.sub;
});
//# sourceMappingURL=current-user.decorator.js.map