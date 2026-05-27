import crypto from 'crypto';

// AES-256-GCM configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes is standard for GCM
const AUTH_TAG_LENGTH = 16;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;


export function encrypt(text: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined in environment variables');
  }

  // Create an initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher
  // We cast to CipherGCM so TypeScript knows getAuthTag() exists
  const cipher = crypto.createCipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'base64'), 
    iv
  ) as crypto.CipherGCM;

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get the authentication tag (unique to GCM mode)
  const authTag = cipher.getAuthTag().toString('hex');

  // Return IV + AuthTag + Ciphertext as a single string
  // We need all three to decrypt it later!
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM ciphertext
 */
export function decrypt(ciphertext: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not defined');
  }

  const [ivHex, authTagHex, encryptedText] = ciphertext.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'base64'), 
    iv
  ) as crypto.DecipherGCM;

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}