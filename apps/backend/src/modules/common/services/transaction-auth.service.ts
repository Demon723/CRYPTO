import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../modules/prisma.service';
import * as crypto from 'crypto';

export interface PinBiometricSettings {
  hasPin: boolean;
  hasBiometric: boolean;
  isPinBiometricRequired: boolean;
}

export interface BiometricChallenge {
  challenge: string;
  expiresAt: Date;
}

@Injectable()
export class TransactionAuthService {
  private readonly logger = new Logger(TransactionAuthService.name);
  private readonly bcryptRounds = 12;
  private readonly challengeTTLMs = 5 * 60 * 1000; // 5 minutes
  private readonly pendingChallenges = new Map<string, BiometricChallenge>();

  constructor(private readonly prisma: PrismaService) {}

  async setPin(userId: string, pin: string): Promise<{ success: boolean; message: string }> {
    if (!/^\d{6}$/.test(pin)) {
      throw new ForbiddenException('PIN must be exactly 6 digits');
    }

    const pinHash = await import('bcrypt').then(bcrypt => bcrypt.hash(pin, this.bcryptRounds));

    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash },
    });

    this.logger.log(`PIN set for user ${userId}`, 'TransactionAuthService');
    return { success: true, message: 'PIN set successfully' };
  }

  async verifyPin(userId: string, pin: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinHash: true },
    });

    if (!user || !user.pinHash) {
      return false;
    }

    const bcrypt = await import('bcrypt');
    return bcrypt.compare(pin, user.pinHash);
  }

  async removePin(userId: string): Promise<{ success: boolean; message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash: null },
    });

    this.logger.log(`PIN removed for user ${userId}`, 'TransactionAuthService');
    return { success: true, message: 'PIN removed successfully' };
  }

  async enableBiometric(userId: string, publicKey: string): Promise<{ success: boolean; message: string }> {
    if (!publicKey || publicKey.length < 32) {
      throw new ForbiddenException('Invalid biometric public key');
    }

    // Validate that the public key is valid base64 and represents a valid EC public key
    try {
      const publicKeyBuffer = Buffer.from(publicKey, 'base64');
      crypto.createPublicKey({
        key: publicKeyBuffer,
        format: 'der',
        type: 'spki',
      });
    } catch (error) {
      throw new ForbiddenException('Invalid biometric public key format. Must be a valid base64-encoded SPKI public key.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        biometricEnabled: true,
        biometricPublicKey: publicKey,
      },
    });

    this.logger.log(`Biometric enabled for user ${userId}`, 'TransactionAuthService');
    return { success: true, message: 'Biometric authentication enabled' };
  }

  async disableBiometric(userId: string): Promise<{ success: boolean; message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        biometricEnabled: false,
        biometricPublicKey: null,
      },
    });

    this.logger.log(`Biometric disabled for user ${userId}`, 'TransactionAuthService');
    return { success: true, message: 'Biometric authentication disabled' };
  }

  async updateSettings(userId: string, isPinBiometricRequired: boolean): Promise<{ success: boolean; message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinHash: true, biometricEnabled: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (isPinBiometricRequired && !user.pinHash && !user.biometricEnabled) {
      throw new ForbiddenException('Cannot require PIN/biometric without setting up at least one method');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isPinBiometricRequired },
    });

    this.logger.log(`PIN/biometric settings updated for user ${userId}: required=${isPinBiometricRequired}`, 'TransactionAuthService');
    return { success: true, message: 'Settings updated successfully' };
  }

  async getSettings(userId: string): Promise<PinBiometricSettings> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        pinHash: true,
        biometricEnabled: true,
        isPinBiometricRequired: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      hasPin: !!user.pinHash,
      hasBiometric: user.biometricEnabled,
      isPinBiometricRequired: user.isPinBiometricRequired,
    };
  }

  async generateBiometricChallenge(userId: string): Promise<BiometricChallenge> {
    // Remove any existing challenge for this user
    this.pendingChallenges.delete(userId);

    const challenge = crypto.randomBytes(32).toString('base64');
    const expiresAt = new Date(Date.now() + this.challengeTTLMs);

    this.pendingChallenges.set(userId, { challenge, expiresAt });

    return { challenge, expiresAt };
  }

  async verifyBiometricSignature(userId: string, challenge: string, signature: string): Promise<boolean> {
    // Check if there's a pending challenge
    const pendingChallenge = this.pendingChallenges.get(userId);
    if (!pendingChallenge) {
      return false;
    }

    // Check if challenge expired
    if (new Date() > pendingChallenge.expiresAt) {
      this.pendingChallenges.delete(userId);
      return false;
    }

    // Verify challenge matches
    if (pendingChallenge.challenge !== challenge) {
      return false;
    }

    // Remove the used challenge
    this.pendingChallenges.delete(userId);

    // Get user's public key
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { biometricPublicKey: true, biometricEnabled: true },
    });

    if (!user || !user.biometricEnabled || !user.biometricPublicKey) {
      return false;
    }

    // Verify the signature using the stored public key
    try {
      const publicKeyBuffer = Buffer.from(user.biometricPublicKey, 'base64');
      const signatureBuffer = Buffer.from(signature, 'base64');
      const challengeBuffer = Buffer.from(challenge, 'base64');

      const verifyKey = crypto.createPublicKey({
        key: publicKeyBuffer,
        format: 'der',
        type: 'spki',
      });

      const isValid = crypto.verify(
        null,
        challengeBuffer,
        verifyKey,
        signatureBuffer,
      );

      return isValid;
    } catch (error) {
      this.logger.error(`Biometric signature verification failed for user ${userId}:`, error);
      return false;
    }
  }

  async requireTransactionAuth(userId: string, pin?: string, biometricSignature?: string): Promise<void> {
    const settings = await this.getSettings(userId);

    if (!settings.isPinBiometricRequired) {
      return;
    }

    const pinValid = settings.hasPin && pin ? await this.verifyPin(userId, pin) : false;
    const biometricValid = settings.hasBiometric && !!biometricSignature;

    if (!pinValid && !biometricValid) {
      throw new ForbiddenException('Transaction authorization required: provide valid PIN or biometric signature');
    }
  }
}
