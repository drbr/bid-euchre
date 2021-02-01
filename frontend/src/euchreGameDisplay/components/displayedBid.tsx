import { Bid } from '../../gameLogic/EuchreTypes';
import { PLACEHOLDER } from './PlayerArea';

export function displayedBid(bid: Bid | null): string {
  const translatedBid =
    bid === 'pass' ? 'Pass' : bid === null ? PLACEHOLDER : bid;
  return String(translatedBid);
}
