/**
 * Vanguard Pro: Zero-Knowledge E2EE Cryptography Foundation
 * Powered by jose and WebCrypto API for JWE (JSON Web Encryption).
 */
import * as jose from "jose";

/**
 * Generates a symmetric key from a user-provided secret (passphrase).
 * In a real implementation, we would use PBKDF2 to derive a key from a password.
 */
export async function deriveEncryptionKey(passphrase: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(passphrase);
  
  // Use SHA-256 to ensure a fixed 256-bit key for AES-GCM
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

/**
 * Encrypts a JSON payload into a JWE (JSON Web Encryption) string.
 * @param payload - The sensitive data to encrypt
 * @param secret - Uint8Array symmetric key
 */
export async function encryptPayload<T>(payload: T, secret: Uint8Array): Promise<string> {
  const jwe = await new jose.CompactEncrypt(
    new TextEncoder().encode(JSON.stringify(payload))
  )
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(secret);

  return jwe;
}

/**
 * Decrypts a JWE string back into a JSON payload.
 * @param jwe - The encrypted string
 * @param secret - Uint8Array symmetric key
 */
export async function decryptPayload<T>(jwe: string, secret: Uint8Array): Promise<T> {
  const { plaintext } = await jose.compactDecrypt(jwe, secret);
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
