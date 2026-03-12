import * as argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password + process.env.PASSWORD_PEPPER, {
    type: argon2.argon2id,
    memoryCost: 65536, // suggested production >= 64MB
    timeCost: 3, // 3 is balanced
    parallelism: 2, // 1 or 2 thread (common for nodejs), higher can raise CPU
  });
}

export async function verifyPassword(
  hash: string,
  password: string,
): Promise<boolean> {
  return await argon2.verify(hash, password + process.env.PASSWORD_PEPPER);
}
