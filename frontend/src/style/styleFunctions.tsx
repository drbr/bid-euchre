import { style, types } from 'typestyle';

export function cssClass(
  name: string,
  ...styles: types.NestedCSSProperties[]
): string {
  return style({ $debugName: name }, ...styles);
}
