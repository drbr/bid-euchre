import { customAlphabet } from 'nanoid';
const generateNumbers = customAlphabet('0123456789', 5);
const generateLetters = customAlphabet('abcdefghijklmnopqrstuvwxyz', 5);

export function generateFriendlyId(): string {
  return `${generateLetters()}-${generateNumbers()}`;
}
