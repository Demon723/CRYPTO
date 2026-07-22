import { UserRole } from '../../../modules/auth/entities/user.entity';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const AllowAnonymous: () => import("@nestjs/common").CustomDecorator<string>;
