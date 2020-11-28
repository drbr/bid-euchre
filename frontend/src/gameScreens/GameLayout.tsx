import { Position } from '../../../functions/apiContract/database/GameState';
import { cssClass } from '../style/styleFunctions';

export type GameLayoutProps = {
  seatedAt: Position | null;
  renderPlayerElement: (position: Position) => React.ReactNode;
  tableCenterElement: React.ReactNode;
};

const positionsByViewpoint: Record<Position, ReadonlyArray<Position>> = {
  north: ['south', 'east', 'west', 'north'],
  south: ['north', 'west', 'east', 'south'],
  east: ['west', 'south', 'north', 'east'],
  west: ['east', 'north', 'south', 'west'],
};

export function GameLayout(props: GameLayoutProps) {
  // Spectators view the game from South
  const positionsInOrder = positionsByViewpoint[props.seatedAt || 'south'];

  return (
    <table className={GameLayoutClass}>
      <tbody>
        <tr>
          <Cell />
          <PlayerCell>
            {props.renderPlayerElement(positionsInOrder[0])}
          </PlayerCell>
          <Cell />
        </tr>
        <tr>
          <PlayerCell>
            {props.renderPlayerElement(positionsInOrder[1])}
          </PlayerCell>
          <CenterCell>{props.tableCenterElement}</CenterCell>
          <PlayerCell>
            {props.renderPlayerElement(positionsInOrder[2])}
          </PlayerCell>
        </tr>
        <tr>
          <Cell />
          <PlayerCell>
            {props.renderPlayerElement(positionsInOrder[3])}
          </PlayerCell>
          <Cell />
        </tr>
      </tbody>
    </table>
  );
}

function Cell(props: React.PropsWithChildren<unknown>) {
  return <td style={{ width: '30%', padding: 20 }}>{props.children}</td>;
}

function CenterCell(props: React.PropsWithChildren<unknown>) {
  return (
    <Cell>
      <div className={CenterCellClass}>{props.children}</div>
    </Cell>
  );
}

function PlayerCell(props: React.PropsWithChildren<unknown>) {
  return (
    <Cell>
      <div className={PlayerCellClass}>{props.children}</div>
    </Cell>
  );
}

const GameLayoutClass = cssClass('GameLayout', {
  width: '100vw',
  textAlign: 'left',
});

const PlayerCellClass = cssClass('PlayerCell', {
  border: '2px solid',
  padding: 10,
  height: 100,
});

const CenterCellClass = cssClass('CenterCell', {
  textAlign: 'center',
});
