import { style } from 'typestyle';
import { cssClass } from './styleFunctions';

export const AppStyle = cssClass('AppContainer', {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontSize: 'calc(10px + 2vmin)',
});

export const FooterStyle = cssClass('AppFooter', {
  width: '100vw',
  fontSize: '1rem',
  fontWeight: 600,
  display: 'flex',
  alignContent: 'center',
});

export const ColorSchemes = [
  {
    $debugName: 'ColorScheme-Green',
    backgroundColor: '#076324',
    color: '#fefefe',
  },
  {
    $debugName: 'ColorScheme-Puce',
    backgroundColor: '#542c3e',
    color: '#fefefe',
  },
  {
    $debugName: 'ColorScheme-White',
    backgroundColor: 'white',
    color: 'black',
  },
];

export const ColorSchemeClasses: ReadonlyArray<string> = ColorSchemes.map(
  (scheme) => style(scheme)
);

export const ColorSwatchStyle = cssClass('ColorSwatch', {
  height: 25,
  width: 25,
  border: '2px solid black',
});
