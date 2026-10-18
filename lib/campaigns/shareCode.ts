const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const LENGTH = 8;

export function generateShareCode(): string {
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}