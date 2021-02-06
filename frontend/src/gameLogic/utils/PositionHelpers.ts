import { Position } from '../apiContract/database/Position';
import { Partnership } from '../EuchreTypes';

/** Maps each position to the next player, going around the table to the left. */
export const NextPlayer: Record<Position, Position> = {
  north: 'east',
  east: 'south',
  south: 'west',
  west: 'north',
};

export const PartnershipForPosition: Record<Position, Partnership> = {
  north: 'northsouth',
  south: 'northsouth',
  east: 'eastwest',
  west: 'eastwest',
};

export const PositionsForPartnership: Record<
  Partnership,
  ReadonlyArray<Position>
> = {
  northsouth: ['north', 'south'],
  eastwest: ['east', 'west'],
};

export const OpposingTeamOf: Record<Partnership, Partnership> = {
  northsouth: 'eastwest',
  eastwest: 'northsouth',
};

export const PartnerOf: Record<Position, Position> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
};

/**
 * Iterates over a position record and returns an array of mapped values. These values are not
 * guaranteed to be in any order.
 *
 * @param record
 * @param iteratee
 */
export function mapPositions<T, U>(
  record: Record<Position, T>,
  iteratee: (t: T, p: Position) => U
): U[] {
  const result: U[] = [];
  for (const pos in record) {
    const position = pos as Position;
    const mapped = iteratee(record[position], position);
    result.push(mapped);
  }
  return result;
}

/**
 * Iterates over a position record and performs the iteratee on each. These values are not
 * guaranteed to be in any order.
 *
 * @param record
 * @param iteratee
 */
export function forEachPosition<T>(
  record: Record<Position, T>,
  iteratee: (t: T, p: Position) => void
): void {
  mapPositions(record, iteratee);
}
