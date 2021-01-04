import Grid from '@material-ui/core/Grid';
import { Card, Hand } from '../gameLogic/Cards';
import { CardComponentMapping } from '../cards/CardComponentMapping';

export type HandDisplayProps = {
  hand: Hand;
};

export function HandDisplay(props: HandDisplayProps) {
  return (
    <Grid container spacing={1} alignContent="center">
      {props.hand.map((card) => (
        <CardInRow card={card} key={keyForCard(card)} />
      ))}
    </Grid>
  );
}

export type CardInRowProps = {
  card: Card;
};

export function CardInRow(props: CardInRowProps) {
  const { suit, rank } = props.card;
  const CardComponent = CardComponentMapping[suit][rank];
  return (
    <Grid item xs={2} sm={2}>
      <CardComponent
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
      />
    </Grid>
  );
}

function keyForCard(card: Card): string {
  return card.rank + card.suit;
}
