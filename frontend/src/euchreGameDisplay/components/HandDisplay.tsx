import {
  ActionButton,
  actionButtonPropsForGameEvent,
  GameDisplayPropsForActionButton,
} from './ActionButton';
import { Card, Hand } from '../../gameLogic/Cards';
import { CardComponentMapping } from '../../cards/CardComponentMapping';
import FlexView from 'react-flexview/lib';
import { PlayCardEvent } from '../../gameLogic/euchreStateMachine/ThePlayStateTypes';
import {
  ScopedGameDisplayProps,
  UnscopedGameDisplayProps,
} from '../GameDisplayProps';
import { RoundContextAlways } from '../../gameLogic/euchreStateMachine/RoundStateTypes';
import { AnyEventObject } from 'xstate';

/**
 * Props for Hand Display when cards cannot be played
 */
export type HandDisplayStaticProps = Pick<
  UnscopedGameDisplayProps,
  'seatedAt'
> &
  Pick<
    ScopedGameDisplayProps<RoundContextAlways, AnyEventObject>,
    'stateContext'
  >;

/**
 * Props for Hand Display in either static or dynamic mode
 */
export type HandDisplayProps = HandDisplayStaticProps &
  (
    | {
        renderAsButtons: false;
      }
    | (GameDisplayPropsForActionButton<PlayCardEvent> & {
        renderAsButtons: true;
      })
  );

export function HandDisplay(props: HandDisplayProps) {
  if (!props.seatedAt) {
    return null;
  }

  const position = props.seatedAt;

  // TODO Temp code for seven cards in a hand
  const modifiedHand: Hand = [
    ...props.stateContext.private_hands[position],
    { suit: 'S', rank: 'A' },
  ];

  if (!props.renderAsButtons) {
    return (
      <FlexView hAlignContent="center">
        {modifiedHand.map((card) => (
          <CardIcon card={card} key={keyForCard(card)} />
        ))}
      </FlexView>
    );
  }

  const allCardButtonProps = modifiedHand.map((card) => ({
    card,
    actionButtonProps: actionButtonPropsForGameEvent(
      {
        type: 'PLAY_CARD',
        position,
        card,
      },
      props
    ),
  }));

  return (
    <FlexView hAlignContent="center">
      {allCardButtonProps.map((cardProps) => (
        <ActionButton
          {...cardProps.actionButtonProps}
          key={keyForCard(cardProps.card)}
        >
          <CardIcon card={cardProps.card} />
        </ActionButton>
      ))}
    </FlexView>
  );
}

export const CARD_MAX_WIDTH = 100;

export function CardIcon(props: { card: Card }) {
  const { suit, rank } = props.card;
  const CardComponent = CardComponentMapping[suit][rank];
  return (
    <div style={{ paddingLeft: 3, paddingRight: 3, maxWidth: CARD_MAX_WIDTH }}>
      <CardComponent
        preserveAspectRatio="xMidYMid meet"
        width="100%"
        height="100%"
      />
    </div>
  );
}

function keyForCard(card: Card): string {
  return card.rank + card.suit;
}
