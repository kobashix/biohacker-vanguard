/**
 * Vanguard Pro: Zero-Knowledge E2EE Cryptography Foundation
 * Powered by jose and WebCrypto API for JWE (JSON Web Encryption).
 */
import * as jose from "jose";

/**
 * Generates a symmetric key from a user-provided secret (passphrase) using PBKDF2.
 * Includes a salt for brute-force resistance.
 */
export async function deriveEncryptionKey(passphrase: string, salt: string = "vanguard-pro-default-salt"): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  
  // Import the raw passphrase as a CryptoKey
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  // Derive a 256-bit AES-GCM key using PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // Export the key back to raw bytes for compatibility with 'jose'
  const exportedKey = await crypto.subtle.exportKey("raw", derivedKey);
  return new Uint8Array(exportedKey);
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
