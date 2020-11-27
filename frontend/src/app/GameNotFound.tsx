import { NewGameSection } from '../app/Lobby';

export function GameNotFound() {
  return (
    <div>
      <p>A game with that ID was not found.</p>
      <NewGameSection />
    </div>
  );
}
