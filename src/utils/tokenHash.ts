export const hashToken = async (token: string): Promise<string> => {
  const hasher = new Bun.CryptoHasher("sha256");
  hasher.update(token);
  return hasher.digest("hex");
};
