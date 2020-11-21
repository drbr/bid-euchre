import { v4 as uuidv4 } from 'uuid';

export function executeNewGame() {
  const gameId = uuidv4();
  console.log(`New game ID: ${gameId}`);
  return gameId;
}
