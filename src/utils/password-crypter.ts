import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

const algorithm = "aes-256-ctr";
let secretKey: string | undefined = process.env.TOKEN_SECRET;

if (!secretKey) {
  console.error("Provide TOKEN_SECRET.");
  throw new Error("TOKEN_SECRET does not exist");
}

export const hashToken = (token: string): string => {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(token);
  return hasher.digest("hex");
};
