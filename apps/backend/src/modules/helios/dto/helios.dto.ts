export class BindWalletDto {
  tokenId: number;
  wallet: string;
  nonce: number;
  chipSignature: string;
}

export class TapToPayDto {
  tokenId: number;
  to: string;
  value: string;
  data: string;
  nonce: number;
  chipSignature: string;
}

export class RegisterCardholderDto {
  tokenId: number;
  nameHash: string;
  kycHash: string;
}

export class DepositToTbaDto {
  tokenId: number;
  amount: string;
}

export class FounderActivateDto {
  tokenId: number;
}

export class FounderFreezeDto {
  tokenId: number;
  reason: string;
}

export class FounderDeactivateDto {
  tokenId: number;
  reason: string;
}
