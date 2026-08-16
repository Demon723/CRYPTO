import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { HeliosService } from '../services/helios.service';
import { BindWalletDto, TapToPayDto, RegisterCardholderDto, DepositToTbaDto, FounderActivateDto, FounderFreezeDto, FounderDeactivateDto } from '../dto/helios.dto';

@Controller('helios')
export class HeliosController {
  constructor(private readonly heliosService: HeliosService) {}

  @Get('token/:tokenId/state')
  async getTokenState(@Param('tokenId') tokenId: number) {
    return this.heliosService.getTokenState(tokenId);
  }

  @Get('wallet/:wallet/key')
  async isKeyValid(@Param('wallet') wallet: string) {
    return this.heliosService.isKeyValid(wallet);
  }

  @Post('cardholder/register')
  async registerCardholder(@Body() dto: RegisterCardholderDto) {
    return this.heliosService.registerCardholder(dto);
  }

  @Get('cardholder/:tokenId')
  async getCardholder(@Param('tokenId') tokenId: number) {
    return this.heliosService.getCardholder(tokenId);
  }

  @Post('bind-wallet')
  async bindWallet(@Body() dto: BindWalletDto) {
    return this.heliosService.bindWallet(dto);
  }

  @Post('tap-to-pay')
  async tapToPay(@Body() dto: TapToPayDto) {
    return this.heliosService.tapToPay(dto);
  }

  @Post('tba/deposit')
  async depositToTba(@Body() dto: DepositToTbaDto) {
    return this.heliosService.depositToTba(dto);
  }

  @Post('founder/activate')
  async founderActivate(@Body() dto: FounderActivateDto) {
    return this.heliosService.founderActivate(dto);
  }

  @Post('founder/freeze')
  async founderFreeze(@Body() dto: FounderFreezeDto) {
    return this.heliosService.founderFreeze(dto);
  }

  @Post('founder/deactivate')
  async founderDeactivate(@Body() dto: FounderDeactivateDto) {
    return this.heliosService.founderDeactivate(dto);
  }
}
