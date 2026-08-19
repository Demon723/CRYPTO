import { sha256 } from '../crypto/hash';

export interface Bip85Config {
  master: Buffer;
  application: string;
  outputEntropy: number;
  index: number;
}

export interface Bip85Result {
  entropy: Buffer;
  mnemonic?: string;
  hex?: string;
}

export class Bip85 {
  static deriveEntropy(config: Bip85Config): Buffer {
    const path = Buffer.concat([
      Buffer.from('m'),
      Buffer.from([0x00]),
      Buffer.from('bip85'),
      Buffer.from(config.application, 'utf-8'),
      Buffer.from([config.outputEntropy & 0xFF]),
      Buffer.from([(config.index >> 24) & 0xFF, (config.index >> 16) & 0xFF, (config.index >> 8) & 0xFF, config.index & 0xFF]),
    ]);
    return Buffer.from(sha256(path));
  }

  static deriveMnemonic(config: Bip85Config & { wordCount: number }): { entropy: Buffer; mnemonic: string } {
    const entropy = this.deriveEntropy(config);
    const mnemonic = entropyToMnemonic(entropy, config.wordCount);
    return { entropy, mnemonic };
  }

  static deriveXprv(config: Bip85Config): string {
    const entropy = this.deriveEntropy(config);
    const hex = entropy.toString('hex').substring(0, 64);
    return `xprv9s21ZrQH143K3...${hex}`;
  }
}

function entropyToMnemonic(entropy: Buffer, wordCount: number): string {
  const bits = entropy.subarray(0, wordCount / 3);
  const checksum = sha256(bits).subarray(0, 1)[0] >> 4;
  const combined = Buffer.concat([bits, Buffer.from([checksum])]);
  const WORDLIST = [
    'abandon','ability','able','about','above','absent','absorb','abstract','absurd','abuse',
    'access','accident','account','accuse','achieve','acid','acoustic','acquire','across','act',
    'action','actor','actress','actual','adapt','add','addict','address','adjust','admit',
    'adult','advance','advice','aerobic','affair','afford','afraid','again','age','agent'
  ];
  const words: string[] = [];
  for (let i = 0; i < combined.length; i++) {
    words.push(WORDLIST[combined[i] % WORDLIST.length]);
  }
  return words.slice(0, wordCount / 3).join(' ');
}
