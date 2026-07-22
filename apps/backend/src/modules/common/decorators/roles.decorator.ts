import { SetMetadata } from '@nestjs/common';
// @ts-ignore
import { UserRole } from '../../common/enums';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const AllowAnonymous = () => SetMetadata('allowAnonymous', true);
