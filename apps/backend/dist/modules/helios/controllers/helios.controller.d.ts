import { HeliosService } from '../services/helios.service';
import { BindWalletDto, TapToPayDto, RegisterCardholderDto, DepositToTbaDto, FounderActivateDto, FounderFreezeDto, FounderDeactivateDto } from '../dto/helios.dto';
export declare class HeliosController {
    private readonly heliosService;
    constructor(heliosService: HeliosService);
    getTokenState(tokenId: number): Promise<any>;
    isKeyValid(wallet: string): Promise<{
        valid: boolean;
        tokenId: number;
    }>;
    registerCardholder(dto: RegisterCardholderDto): Promise<any>;
    getCardholder(tokenId: number): Promise<any>;
    bindWallet(dto: BindWalletDto): Promise<any>;
    tapToPay(dto: TapToPayDto): Promise<any>;
    depositToTba(dto: DepositToTbaDto): Promise<any>;
    founderActivate(dto: FounderActivateDto): Promise<any>;
    founderFreeze(dto: FounderFreezeDto): Promise<any>;
    founderDeactivate(dto: FounderDeactivateDto): Promise<any>;
}
