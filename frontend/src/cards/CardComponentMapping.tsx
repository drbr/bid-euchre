import { Suit, Rank } from '../gameLogic/Cards';

import src9C, { ReactComponent as _9C } from './svg/jumbo/9C.svg';
import srcTC, { ReactComponent as TC } from './svg/jumbo/TC.svg';
import srcJC, { ReactComponent as JC } from './svg/jumbo/JC.svg';
import srcQC, { ReactComponent as QC } from './svg/jumbo/QC.svg';
import srcKC, { ReactComponent as KC } from './svg/jumbo/KC.svg';
import srcAC, { ReactComponent as AC } from './svg/jumbo/AC.svg';
import src9D, { ReactComponent as _9D } from './svg/jumbo/9D.svg';
import srcTD, { ReactComponent as TD } from './svg/jumbo/TD.svg';
import srcJD, { ReactComponent as JD } from './svg/jumbo/JD.svg';
import srcQD, { ReactComponent as QD } from './svg/jumbo/QD.svg';
import srcKD, { ReactComponent as KD } from './svg/jumbo/KD.svg';
import srcAD, { ReactComponent as AD } from './svg/jumbo/AD.svg';
import src9H, { ReactComponent as _9H } from './svg/jumbo/9H.svg';
import srcTH, { ReactComponent as TH } from './svg/jumbo/TH.svg';
import srcJH, { ReactComponent as JH } from './svg/jumbo/JH.svg';
import srcQH, { ReactComponent as QH } from './svg/jumbo/QH.svg';
import srcKH, { ReactComponent as KH } from './svg/jumbo/KH.svg';
import srcAH, { ReactComponent as AH } from './svg/jumbo/AH.svg';
import src9S, { ReactComponent as _9S } from './svg/jumbo/9S.svg';
import srcTS, { ReactComponent as TS } from './svg/jumbo/TS.svg';
import srcJS, { ReactComponent as JS } from './svg/jumbo/JS.svg';
import srcQS, { ReactComponent as QS } from './svg/jumbo/QS.svg';
import srcKS, { ReactComponent as KS } from './svg/jumbo/KS.svg';
import srcAS, { ReactComponent as AS } from './svg/jumbo/AS.svg';

type CardComponentSpec = {
  src: string;
  component: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  cardName: string;
};

export const CardComponentMapping: Record<
  Suit,
  Record<Rank, CardComponentSpec>
> = {
  C: {
    '9': { src: src9C, component: _9C, cardName: '9 of Clubs' },
    '10': { src: srcTC, component: TC, cardName: '10 of Clubs' },
    J: { src: srcJC, component: JC, cardName: 'Jack of Clubs' },
    Q: { src: srcQC, component: QC, cardName: 'Queen of Clubs' },
    K: { src: srcKC, component: KC, cardName: 'King of Clubs' },
    A: { src: srcAC, component: AC, cardName: 'Ace of Clubs' },
  },
  D: {
    '9': { src: srcAD, component: _9D, cardName: '9 of Diamonds' },
    '10': { src: srcKD, component: TD, cardName: '10 of Diamonds' },
    J: { src: srcQD, component: JD, cardName: 'Jack of Diamonds' },
    Q: { src: srcJD, component: QD, cardName: 'Queen of Diamonds' },
    K: { src: srcTD, component: KD, cardName: 'King of Diamonds' },
    A: { src: src9D, component: AD, cardName: 'Ace of Diamonds' },
  },
  H: {
    '9': { src: src9H, component: _9H, cardName: '9 of Hearts' },
    '10': { src: srcTH, component: TH, cardName: '10 of Hearts' },
    J: { src: srcJH, component: JH, cardName: 'Jack of Hearts' },
    Q: { src: srcQH, component: QH, cardName: 'Queen of Hearts' },
    K: { src: srcKH, component: KH, cardName: 'King of Hearts' },
    A: { src: srcAH, component: AH, cardName: 'Ace of Hearts' },
  },
  S: {
    '9': { src: src9S, component: _9S, cardName: '9 of Spades' },
    '10': { src: srcTS, component: TS, cardName: '10 of Spades' },
    J: { src: srcJS, component: JS, cardName: 'Jack of Spades' },
    Q: { src: srcQS, component: QS, cardName: 'Queen of Spades' },
    K: { src: srcKS, component: KS, cardName: 'King of Spades' },
    A: { src: srcAS, component: AS, cardName: 'Ace of Spades' },
  },
};
