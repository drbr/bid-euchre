import { Suit, Rank } from '../gameLogic/Cards';

import { ReactComponent as _9C } from './svg/jumbo/9C.svg';
import { ReactComponent as TC } from './svg/jumbo/TC.svg';
import { ReactComponent as JC } from './svg/jumbo/JC.svg';
import { ReactComponent as QC } from './svg/jumbo/QC.svg';
import { ReactComponent as KC } from './svg/jumbo/KC.svg';
import { ReactComponent as AC } from './svg/jumbo/AC.svg';
import { ReactComponent as _9D } from './svg/jumbo/9D.svg';
import { ReactComponent as TD } from './svg/jumbo/TD.svg';
import { ReactComponent as JD } from './svg/jumbo/JD.svg';
import { ReactComponent as QD } from './svg/jumbo/QD.svg';
import { ReactComponent as KD } from './svg/jumbo/KD.svg';
import { ReactComponent as AD } from './svg/jumbo/AD.svg';
import { ReactComponent as _9H } from './svg/jumbo/9H.svg';
import { ReactComponent as TH } from './svg/jumbo/TH.svg';
import { ReactComponent as JH } from './svg/jumbo/JH.svg';
import { ReactComponent as QH } from './svg/jumbo/QH.svg';
import { ReactComponent as KH } from './svg/jumbo/KH.svg';
import { ReactComponent as AH } from './svg/jumbo/AH.svg';
import { ReactComponent as _9S } from './svg/jumbo/9S.svg';
import { ReactComponent as TS } from './svg/jumbo/TS.svg';
import { ReactComponent as JS } from './svg/jumbo/JS.svg';
import { ReactComponent as QS } from './svg/jumbo/QS.svg';
import { ReactComponent as KS } from './svg/jumbo/KS.svg';
import { ReactComponent as AS } from './svg/jumbo/AS.svg';

type CardComponentSpec = {
  component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  cardName: string;
};

export const CardComponentMapping: Record<
  Suit,
  Record<Rank, CardComponentSpec>
> = {
  C: {
    '9': { component: _9C, cardName: '9 of Clubs' },
    '10': { component: TC, cardName: '10 of Clubs' },
    J: { component: JC, cardName: 'Jack of Clubs' },
    Q: { component: QC, cardName: 'Queen of Clubs' },
    K: { component: KC, cardName: 'King of Clubs' },
    A: { component: AC, cardName: 'Ace of Clubs' },
  },
  D: {
    '9': { component: _9D, cardName: '9 of Diamonds' },
    '10': { component: TD, cardName: '10 of Diamonds' },
    J: { component: JD, cardName: 'Jack of Diamonds' },
    Q: { component: QD, cardName: 'Queen of Diamonds' },
    K: { component: KD, cardName: 'King of Diamonds' },
    A: { component: AD, cardName: 'Ace of Diamonds' },
  },
  H: {
    '9': { component: _9H, cardName: '9 of Hearts' },
    '10': { component: TH, cardName: '10 of Hearts' },
    J: { component: JH, cardName: 'Jack of Hearts' },
    Q: { component: QH, cardName: 'Queen of Hearts' },
    K: { component: KH, cardName: 'King of Hearts' },
    A: { component: AH, cardName: 'Ace of Hearts' },
  },
  S: {
    '9': { component: _9S, cardName: '9 of Spades' },
    '10': { component: TS, cardName: '10 of Spades' },
    J: { component: JS, cardName: 'Jack of Spades' },
    Q: { component: QS, cardName: 'Queen of Spades' },
    K: { component: KS, cardName: 'King of Spades' },
    A: { component: AS, cardName: 'Ace of Spades' },
  },
};
