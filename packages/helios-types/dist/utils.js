export function isPremiumTier(tier) {
    return tier === 0 || tier === 4;
}
export function tierLabel(tier) {
    const labels = ['Genesis', 'Solar', 'Main Sequence', 'Red Giant', 'Supernova'];
    return labels[tier] ?? 'Unknown';
}
export function generateCardNumber(tokenId, tier) {
    const part1 = tier === 0 ? 3000 + (tokenId % 1000) : tier === 4 ? 7000 + (tokenId % 1000) : 1000 + (tokenId % 1000);
    const part2 = tokenId % 10000;
    const part3 = Math.floor(Math.random() * 10000);
    const p1 = String(part1).padStart(4, '0');
    const p2 = String(part2).padStart(4, '0');
    const p3 = String(part3).padStart(4, '0');
    const digits = `${p1}${p2}${p3}`;
    const checksum = luhnChecksum(digits);
    return `H-${p1}-${p2}-${p3}-${checksum}`;
}
export function luhnChecksum(digits) {
    let sum = 0;
    let doubleDigit = true;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i], 10);
        if (doubleDigit) {
            digit *= 2;
            if (digit > 9)
                digit -= 9;
        }
        sum += digit;
        doubleDigit = !doubleDigit;
    }
    return (10 - (sum % 10)) % 10;
}
export function validateCardNumber(cardNumber) {
    const match = cardNumber.match(/^H-(\d{4})-(\d{4})-(\d{4})-(\d)$/);
    if (!match)
        return false;
    const digits = `${match[1]}${match[2]}${match[3]}`;
    const checksum = parseInt(match[4], 10);
    return luhnChecksum(digits) === checksum;
}
export function parseTapToPayMessage(tokenId, to, value, data, nonce, chainId) {
    const dataHash = Buffer.from(data).toString('hex').slice(0, 64).padEnd(64, '0');
    return `keccak256("PAY" || ${tokenId} || ${to} || ${value} || keccak256(${dataHash}) || ${nonce} || ${chainId})`;
}
