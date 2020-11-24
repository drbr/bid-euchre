import { Position } from '../../../functions/apiContract/database/GameState';
import { cssClass } from '../style/styleFunctions';

export type GameLayoutProps = {
  viewpoint: Position;
  renderPlayerElement: (position: Position) => React.ReactNode;
  tableCenterElement: React.ReactNode;
};

export function GameLayout(props: GameLayoutProps) {
  return (
    <table className={GameLayoutClass}>
      <tbody>
        <tr>
          <Cell />
          <PlayerCell>{props.renderPlayerElement('north')}</PlayerCell>
          <Cell />
        </tr>
        <tr>
          <PlayerCell>{props.renderPlayerElement('west')}</PlayerCell>
          <CenterCell>{props.tableCenterElement}</CenterCell>
          <PlayerCell>{props.renderPlayerElement('east')}</PlayerCell>
        </tr>
        <tr>
          <Cell />
          <PlayerCell>{props.renderPlayerElement('south')}</PlayerCell>
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
