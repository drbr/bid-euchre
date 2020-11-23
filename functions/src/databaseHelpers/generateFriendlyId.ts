import { customAlphabet } from 'nanoid';
const generateNumbers = customAlphabet('0123456789', 4);
const generateLetters = customAlphabet('abcdefghijklmnopqrstuvwxyz', 5);

export function generateFriendlyId(): string {
  return `${generateNumbers()}-${generateLetters()}`;
}
