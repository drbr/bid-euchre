import { ReactElement } from 'react';
import FlexView from 'react-flexview/lib';
import { AnyEventObject } from 'xstate';
import { CardComponentMapping } from '../../cards/CardComponentMapping';
import { Position } from '../../gameLogic/apiContract/database/Position';
import { Card } from '../../gameLogic/Cards';
import { RoundContextAlways } from '../../gameLogic/euchreStateMachine/RoundStateTypes';
import { PlayCardEvent } from '../../gameLogic/euchreStateMachine/ThePlayStateTypes';
import { ScopedGameDisplayProps } from '../GameDisplayProps';
import {
  actionButtonPropsForGameEvent,
  GameDisplayPropsForActionButton,
} from './ActionButtonProps';
import { CardActionButton, NonInteractiveCard } from './ActionButton';

/**
 * Props for Hand Display when cards cannot be played
 */
export type HandDisplayStaticProps = { position: Position | null } & Pick<
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
  if (!props.position) {
    return null;
  }
  const position = props.position;
  const playerHand = props.stateContext.private_hands[position];

  if (!props.renderAsButtons) {
    return (
      <CardsRow>
        {playerHand.map((card) => (
          <NonInteractiveCard key={keyForCard(card)}>
            <CardIcon card={card} />
          </NonInteractiveCard>
        ))}
      </CardsRow>
    );
  }

  const allCardButtonProps = playerHand.map((card) => ({
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
    <CardsRow>
      {allCardButtonProps.map((cardProps) => (
        <CardActionButton
          {...cardProps.actionButtonProps}
          key={keyForCard(cardProps.card)}
        >
          <CardIcon card={cardProps.card} />
        </CardActionButton>
      ))}
    </CardsRow>
  );
}

function CardsRow(props: { children: ReactElement[] }) {
  return (
    <FlexView hAlignContent="center" wrap>
      {props.children.map((child) => (
        <div
          style={{
            maxWidth: CARD_MAX_WIDTH,
            width: '16.66%',
          }}
          key={child?.key}
        >
          {child}
        </div>
      ))}
    </FlexView>
  );
}

export const CARD_MAX_WIDTH = 100;

export function CardIcon(props: { card: Card }) {
  const { suit, rank } = props.card;
  const cardSpec = CardComponentMapping[suit][rank];
  const CardComponent = cardSpec.component;
  return (
    <div style={{ height: '100%' }} role="img" aria-label={cardSpec.cardName}>
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
