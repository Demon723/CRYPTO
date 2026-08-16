export const FOUNDER_CONFIG = {
  privateKey: process.env.FOUNDER_PRIVATE_KEY || '',
  pbtAddress: process.env.HELIOS_PBT_ADDRESS || '',
  cardRegistryAddress: process.env.HELIOS_CARD_REGISTRY_ADDRESS || '',
  chipRegistryAddress: process.env.HELIOS_CHIP_REGISTRY_ADDRESS || '',
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
  port: parseInt(process.env.FOUNDER_DEVICE_PORT || '3001', 10),
  uiPort: parseInt(process.env.FOUNDER_UI_PORT || '3002', 10),
  nfcEnabled: process.env.NFC_ENABLED === 'true',
  oledEnabled: process.env.OLED_ENABLED === 'true',
  deviceName: process.env.DEVICE_NAME || 'Founder Pi',
  teamMembers: (process.env.TEAM_MEMBERS || '').split(',').filter(Boolean),
};

export const LIFECYCLE_ACTIONS = {
  ACTIVATE: 'activate',
  FREEZE: 'freeze',
  DEACTIVATE: 'deactivate',
} as const;

export const TIER_LABELS = [
  'Genesis',
  'Solar',
  'Main Sequence',
  'Red Giant',
  'Supernova',
] as const;
