import "server-only";

/**
 * Server-side API-key encryption boundary.
 *
 * The master key must live in TORN_API_KEY_ENCRYPTION_KEY as a 32-byte
 * base64 value. API keys are never sent to client components or stored
 * plaintext in the database.
 */
const ALGORITHM = "aes-256-gcm" as const;

function getMasterKey(): Buffer {
  const encoded = process.env.TORN_API_KEY_ENCRYPTION_KEY;
  if (!encoded) throw new Error("TORN_API_KEY_ENCRYPTION_KEY is not configured");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("TORN_API_KEY_ENCRYPTION_KEY must decode to 32 bytes");
  return key;
}

export function encryptApiKey(apiKey: string): string {
  if (!apiKey.trim()) throw new Error("API key cannot be empty");

  // Node's crypto is imported dynamically here so the module stays server-only.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(apiKey, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptApiKey(payload: string): string {
  const [version, ivEncoded, tagEncoded, ciphertextEncoded] = payload.split(".");
  if (version !== "v1" || !ivEncoded || !tagEncoded || !ciphertextEncoded) {
    throw new Error("Invalid encrypted API key payload");
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("node:crypto") as typeof import("node:crypto");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getMasterKey(),
    Buffer.from(ivEncoded, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextEncoded, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
