import { PublicGameConfig } from '../../../functions/apiContract/database/DataModel';

export type ConfigureGameProps = PublicGameConfig & { gameId: string };

export function ConfigureGame(props: ConfigureGameProps) {
  return (
    <div>
      <p>{JSON.stringify(props, null, 2)}</p>
      <p>Enter your name </p>
    </div>
  );
}
