import { Suit } from '../../gameLogic/Cards';

export const SuitDisplayInfo: Record<
  Suit,
  { text: string; longName: string; color: string }
> = {
  H: { text: '♥️', longName: 'hearts', color: 'red' },
  D: { text: '♦️️', longName: 'diamonds', color: 'red' },
  S: { text: '♠', longName: 'spades', color: 'black' },
  C: { text: '♣️️', longName: 'clubs', color: 'black' },
};
