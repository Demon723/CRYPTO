import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../modules/prisma.service';
import { TransactionAuthService } from '../services/transaction-auth.service';

@Injectable()
export class PinBiometricAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactionAuthService: TransactionAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: {
        id: true,
        pinHash: true,
        biometricEnabled: true,
        biometricPublicKey: true,
        isPinBiometricRequired: true,
      },
    });

    if (!dbUser) {
      throw new ForbiddenException('User not found');
    }

    // Check if PIN/biometric is required for this user
    if (!dbUser.isPinBiometricRequired) {
      return true;
    }

    const hasPin = !!dbUser.pinHash;
    const hasBiometric = !!dbUser.biometricEnabled;

    if (!hasPin && !hasBiometric) {
      throw new ForbiddenException('PIN or biometric authentication is required for transactions. Please set up PIN or biometric in security settings.');
    }

    // If PIN is provided, verify it against the stored hash
    if (body.pin) {
      if (!hasPin) {
        throw new ForbiddenException('PIN is not set up for this account');
      }
      
      const isValid = await this.transactionAuthService.verifyPin(user.sub, body.pin);
      if (!isValid) {
        throw new ForbiddenException('Invalid PIN');
      }
      
      request.verifiedPin = true;
      return true;
    }

    // If biometric signature is provided, verify it cryptographically
    if (body.biometricSignature) {
      if (!hasBiometric) {
        throw new ForbiddenException('Biometric is not enabled for this account');
      }
      
      if (!dbUser.biometricPublicKey) {
        throw new ForbiddenException('Biometric public key not found');
      }

      // Expected format: "base64(challenge):base64(signature)"
      const parts = body.biometricSignature.split(':');
      if (parts.length !== 2) {
        throw new ForbiddenException('Invalid biometric signature format. Expected: base64(challenge):base64(signature)');
      }

      const [challengeB64, signatureB64] = parts;
      
      // Verify the signature using the stored public key
      const isValid = await this.transactionAuthService.verifyBiometricSignature(
        user.sub,
        challengeB64,
        signatureB64,
      );
      
      if (!isValid) {
        throw new ForbiddenException('Invalid biometric signature');
      }
      
      request.verifiedBiometric = true;
      return true;
    }

    throw new ForbiddenException('PIN or biometric verification required for this transaction');
  }
}
