import { cssClass, Style } from './styleFunctions';

export const absolutePositionFillStyle: Style = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};

export const absolutePositionFill = cssClass(
  'absolute-position-fill',
  absolutePositionFillStyle
);
