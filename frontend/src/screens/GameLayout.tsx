import { Position } from '../../../functions/apiContract/database/GameState';
import { cssClass } from '../style/styleFunctions';

export type GameLayoutProps = {
  viewpoint: Position;
  renderPlayerElement: (position: Position) => React.ReactNode;
  tableCenterElement: React.ReactNode;
};

export function GameLayout(props: GameLayoutProps) {
  return (
    // <div className={GridClass}>
    //   <div className={PlayerTop}>{props.renderPlayerElement('north')}</div>
    //   <div className={PlayerBottom}>{props.renderPlayerElement('south')}</div>
    //   <div className={PlayerLeft}>{props.renderPlayerElement('west')}</div>
    //   <div className={PlayerRight}>{props.renderPlayerElement('east')}</div>
    //   <div className={Table}>{props.tableCenterElement}</div>
    // </div>

    <table>
      <tr>
        <Cell />
        <PlayerCell>{props.renderPlayerElement('north')}</PlayerCell>
        <Cell />
      </tr>
      <tr>
        <PlayerCell>{props.renderPlayerElement('west')}</PlayerCell>
        <Cell>{props.tableCenterElement}</Cell>
        <PlayerCell>{props.renderPlayerElement('east')}</PlayerCell>
      </tr>
      <tr>
        <Cell />
        <PlayerCell>{props.renderPlayerElement('south')}</PlayerCell>
        <Cell />
      </tr>
    </table>
  );
}

function Cell(props: React.PropsWithChildren<unknown>) {
  return <td style={{ width: '30%', padding: 20 }}>{props.children}</td>;
}

function PlayerCell(props: React.PropsWithChildren<unknown>) {
  return (
    <Cell>
      <div className={PlayerCellClass}>{props.children}</div>
    </Cell>
  );
}

const PlayerCellClass = cssClass('PlayerCell', {
  border: '2px solid',
  padding: 10,
  height: 100,
  // width: 200,
});

// const PlayerTop = cssClass('PlayerTop', {
//   gridArea: 'top',
// });
// const PlayerBottom = cssClass('PlayerBottom', {
//   gridArea: 'bottom',
// });
// const PlayerLeft = cssClass('PlayerLeft', {
//   gridArea: 'left',
// });
// const PlayerRight = cssClass('PlayerRight', {
//   gridArea: 'right',
// });

// const Table = cssClass('TableCenter', {
//   gridArea: 'table',
// });

// const GridClass = cssClass('GameLayout', {
//   height: 750,
//   width: 750,
//   display: 'grid',
//   gridTemplateRows: '1fr 1fr 1fr',
//   gridTemplateColumns: '1fr 1fr 1fr',
//   gridTemplateAreas: `. top .
//   left table right
//   . bottom .`,
// });
