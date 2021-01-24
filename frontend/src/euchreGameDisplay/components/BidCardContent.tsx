import * as React from 'react';
import { Bid } from '../../gameLogic/EuchreTypes';
import { PLACEHOLDER } from './GameLayout';


export function BidCardContent(props: { bid: Bid | null; }) {
  const translatedBid = props.bid === 'pass'
    ? 'Pass'
    : props.bid === null
      ? PLACEHOLDER
      : props.bid;
  return <>{translatedBid}</>;
}
