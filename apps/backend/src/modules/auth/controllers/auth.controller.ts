import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
  UsePipes,
  ValidationPipe,
  Put,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SetPinDto, VerifyPinDto, EnableBiometricDto, UpdatePinBiometricSettingsDto, BiometricChallengeResponse } from '../dto/pin-biometric.dto';
import { TransactionAuthService } from '../../common/services/transaction-auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly transactionAuthService: TransactionAuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Tokens refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: { sub: string; email: string; role: string }) {
    return this.authService.findUserById(user.sub);
  }

  @Post('pin/set')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Set 6-digit PIN for transaction authorization' })
  @ApiResponse({ status: 200, description: 'PIN set successfully' })
  @ApiResponse({ status: 400, description: 'Invalid PIN format' })
  async setPin(@CurrentUser() user: { sub: string }, @Body() dto: SetPinDto) {
    return this.transactionAuthService.setPin(user.sub, dto.pin);
  }

  @Post('pin/verify')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Verify PIN for transaction authorization' })
  @ApiResponse({ status: 200, description: 'PIN is valid' })
  @ApiResponse({ status: 401, description: 'Invalid PIN' })
  async verifyPin(@CurrentUser() user: { sub: string }, @Body() dto: VerifyPinDto) {
    const isValid = await this.transactionAuthService.verifyPin(user.sub, dto.pin);
    if (!isValid) {
      throw new ForbiddenException('Invalid PIN');
    }
    return { valid: true };
  }

  @Post('pin/remove')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove PIN requirement' })
  @ApiResponse({ status: 200, description: 'PIN removed successfully' })
  async removePin(@CurrentUser() user: { sub: string }) {
    return this.transactionAuthService.removePin(user.sub);
  }

  @Post('biometric/enable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Enable biometric authentication with public key' })
  @ApiResponse({ status: 200, description: 'Biometric enabled' })
  @ApiResponse({ status: 400, description: 'Invalid public key' })
  async enableBiometric(@CurrentUser() user: { sub: string }, @Body() dto: EnableBiometricDto) {
    return this.transactionAuthService.enableBiometric(user.sub, dto.publicKey);
  }

  @Post('biometric/disable')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Disable biometric authentication' })
  @ApiResponse({ status: 200, description: 'Biometric disabled' })
  async disableBiometric(@CurrentUser() user: { sub: string }) {
    return this.transactionAuthService.disableBiometric(user.sub);
  }

  @Post('biometric/challenge')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate a challenge for biometric signature' })
  @ApiResponse({ status: 200, description: 'Challenge generated', type: BiometricChallengeResponse })
  async generateBiometricChallenge(@CurrentUser() user: { sub: string }): Promise<BiometricChallengeResponse> {
    return this.transactionAuthService.generateBiometricChallenge(user.sub);
  }

  @Get('security/settings')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get PIN/biometric security settings' })
  @ApiResponse({ status: 200, description: 'Security settings retrieved' })
  async getSecuritySettings(@CurrentUser() user: { sub: string }) {
    return this.transactionAuthService.getSettings(user.sub);
  }

  @Put('security/settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: 'Update PIN/biometric security settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  @ApiResponse({ status: 400, description: 'Cannot require without setup' })
  async updateSecuritySettings(@CurrentUser() user: { sub: string }, @Body() dto: UpdatePinBiometricSettingsDto) {
    return this.transactionAuthService.updateSettings(user.sub, dto.isPinBiometricRequired || false);
  }
}
