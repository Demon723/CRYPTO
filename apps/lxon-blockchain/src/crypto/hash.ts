import { createHash, createHmac } from 'crypto';

export function sha256(data: Uint8Array): Buffer {
  return Buffer.from(createHash('sha256').update(data).digest());
}

export function sha256x2(data: Uint8Array): Buffer {
  return sha256(sha256(data));
}

export function hash160(data: Uint8Array): Buffer {
  return Buffer.from(createHash('ripemd160').update(sha256(data)).digest());
}

export function hash256(data: Uint8Array): Buffer {
  return sha256(sha256(data));
}

export function ripemd160(data: Uint8Array): Buffer {
  return Buffer.from(createHash('ripemd160').update(data).digest());
}

export function hmacSha512(key: Uint8Array | string, data: Uint8Array): Buffer {
  const hmac = createHmac('sha512', typeof key === 'string' ? key : Buffer.from(key));
  hmac.update(data);
  return Buffer.from(hmac.digest());
}

export function taggedHash(tag: string, data: Uint8Array): Buffer {
  const tagHash = sha256(Buffer.from(tag));
  const tagged = Buffer.concat([tagHash, tagHash, Buffer.from(data)]);
  return sha256(tagged);
}
