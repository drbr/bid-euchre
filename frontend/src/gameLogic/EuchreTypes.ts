import { Position } from './apiContract/database/Position';

export type Partnership = 'northsouth' | 'eastwest';

export type Bid = 1 | 2 | 3 | 4 | 5 | 6 | 12 | 24 | 48 | 96 | 192 | 'pass';

export const PartnershipForPlayer: Record<Position, Partnership> = {
  north: 'northsouth',
  south: 'northsouth',
  east: 'eastwest',
  west: 'eastwest',
};
