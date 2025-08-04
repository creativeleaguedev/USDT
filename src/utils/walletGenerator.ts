// Simplified wallet generation for demo purposes
// In production, use proper cryptographic libraries
export interface GeneratedWallet {
  address: string;
  privateKey: string;
}

export const generateWallet = (): GeneratedWallet => {
  // Generate a random hex string for demo purposes
  const generateRandomHex = (length: number) => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Generate a realistic-looking wallet address and private key
  const address = '0x' + generateRandomHex(40);
  const privateKey = generateRandomHex(64);

  return {
    address,
    privateKey
  };
};

export const generateQRCode = (address: string): string => {
  // For demo purposes, use a QR code service
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(address)}`;
};