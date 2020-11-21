import { v4 as uuidv4 } from 'uuid';

export type NewGameResult = {
  gameId: string;
};

export function executeNewGame(): NewGameResult {
  const gameId = uuidv4();
  console.log(`New game ID: ${gameId}`);
  return { gameId };
}
