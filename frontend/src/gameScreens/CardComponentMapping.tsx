import { Suit, Rank } from '../../../functions/apiContract/database/Cards';

import { ReactComponent as _9C } from '../cards/svg/jumbo/9C.svg';
import { ReactComponent as TC } from '../cards/svg/jumbo/TC.svg';
import { ReactComponent as JC } from '../cards/svg/jumbo/JC.svg';
import { ReactComponent as QC } from '../cards/svg/jumbo/QC.svg';
import { ReactComponent as KC } from '../cards/svg/jumbo/KC.svg';
import { ReactComponent as AC } from '../cards/svg/jumbo/AC.svg';
import { ReactComponent as _9D } from '../cards/svg/jumbo/9D.svg';
import { ReactComponent as TD } from '../cards/svg/jumbo/TD.svg';
import { ReactComponent as JD } from '../cards/svg/jumbo/JD.svg';
import { ReactComponent as QD } from '../cards/svg/jumbo/QD.svg';
import { ReactComponent as KD } from '../cards/svg/jumbo/KD.svg';
import { ReactComponent as AD } from '../cards/svg/jumbo/AD.svg';
import { ReactComponent as _9H } from '../cards/svg/jumbo/9H.svg';
import { ReactComponent as TH } from '../cards/svg/jumbo/TH.svg';
import { ReactComponent as JH } from '../cards/svg/jumbo/JH.svg';
import { ReactComponent as QH } from '../cards/svg/jumbo/QH.svg';
import { ReactComponent as KH } from '../cards/svg/jumbo/KH.svg';
import { ReactComponent as AH } from '../cards/svg/jumbo/AH.svg';
import { ReactComponent as _9S } from '../cards/svg/jumbo/9S.svg';
import { ReactComponent as TS } from '../cards/svg/jumbo/TS.svg';
import { ReactComponent as JS } from '../cards/svg/jumbo/JS.svg';
import { ReactComponent as QS } from '../cards/svg/jumbo/QS.svg';
import { ReactComponent as KS } from '../cards/svg/jumbo/KS.svg';
import { ReactComponent as AS } from '../cards/svg/jumbo/AS.svg';

type CardComponent = React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

export const CardComponentMapping: Record<Suit, Record<Rank, CardComponent>> = {
  C: {
    '9': _9C,
    '10': TC,
    J: JC,
    Q: QC,
    K: KC,
    A: AC,
  },
  D: {
    '9': _9D,
    '10': TD,
    J: JD,
    Q: QD,
    K: KD,
    A: AD,
  },
  H: {
    '9': _9H,
    '10': TH,
    J: JH,
    Q: QH,
    K: KH,
    A: AH,
  },
  S: {
    '9': _9S,
    '10': TS,
    J: JS,
    Q: QS,
    K: KS,
    A: AS,
  },
};
