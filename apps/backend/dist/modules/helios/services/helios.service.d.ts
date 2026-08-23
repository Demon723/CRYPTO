import { BindWalletDto, TapToPayDto, RegisterCardholderDto, DepositToTbaDto, FounderActivateDto, FounderFreezeDto, FounderDeactivateDto } from '../dto/helios.dto';
export declare class HeliosService {
    private provider;
    private pbt;
    private cardRegistry;
    private chipRegistry;
    constructor();
    setContracts(pbtAddress: string, cardRegistryAddress: string, chipRegistryAddress: string, pbtAbi: any, cardAbi: any, chipAbi: any): void;
    getTokenState(tokenId: number): Promise<any>;
    isKeyValid(wallet: string): Promise<{
        valid: boolean;
        tokenId: number;
    }>;
    getCardholder(tokenId: number): Promise<any>;
    registerCardholder(dto: RegisterCardholderDto): Promise<any>;
    bindWallet(dto: BindWalletDto): Promise<any>;
    tapToPay(dto: TapToPayDto): Promise<any>;
    depositToTba(dto: DepositToTbaDto): Promise<any>;
    founderActivate(dto: FounderActivateDto): Promise<any>;
    founderFreeze(dto: FounderFreezeDto): Promise<any>;
    founderDeactivate(dto: FounderDeactivateDto): Promise<any>;
    private ensurePbt;
    private ensureCardRegistry;
}
