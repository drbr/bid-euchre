import Grid from '@material-ui/core/Grid';
import { Card, Hand } from '../../../functions/apiContract/database/Cards';
import { CardComponentMapping } from './CardComponentMapping';

export type HandDisplayProps = {
  hand: Hand;
};

export function HandDisplay(props: HandDisplayProps) {
  return (
    <div>
      <p>{JSON.stringify(props.hand)}</p>
      <Grid container spacing={1} alignContent="center">
        <CardInRow card={{ suit: 'H', rank: '9' }} />
        <CardInRow card={{ suit: 'H', rank: '10' }} />
        <CardInRow card={{ suit: 'H', rank: 'J' }} />
        <CardInRow card={{ suit: 'H', rank: 'Q' }} />
        <CardInRow card={{ suit: 'H', rank: 'K' }} />
        <CardInRow card={{ suit: 'H', rank: 'A' }} />
      </Grid>
    </div>
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
