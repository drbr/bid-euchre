import { types, style } from 'typestyle';

export type Style = types.NestedCSSProperties;

export function cssClass(
  name: string,
  ...styles: types.NestedCSSProperties[]
): string {
  return style({ $debugName: name }, ...styles);
}
