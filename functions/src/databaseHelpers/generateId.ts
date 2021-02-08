import { customAlphabet, nanoid } from 'nanoid';

function generateNumbers(n: number) {
  return customAlphabet('0123456789', n);
}

function generateLetters(n: number) {
  return customAlphabet('abcdefghijklmnopqrstuvwxyz', n);
}

export function generateFriendlyId(): string {
  return `${generateNumbers(4)}-${generateLetters(5)}`;
}

export function generateHardToGuessId(): string {
  return nanoid();
}
