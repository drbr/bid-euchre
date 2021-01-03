import { Position } from '../apiContract/database/GameState';

/** Maps each position to the next player, going around the table to the left. */
export const NextPlayer: Record<Position, Position> = {
  north: 'east',
  east: 'south',
  south: 'west',
  west: 'north',
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
