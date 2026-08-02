import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OwnerGuardService implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Only super admin or specific owner role can decrypt user data
    const ownerRoles = ['SUPER_ADMIN', 'OWNER'];
    
    if (!user || !ownerRoles.includes(user.role)) {
      throw new ForbiddenException('Only the Synex owner can access decrypted user data');
    }
    
    return true;
  }
}
