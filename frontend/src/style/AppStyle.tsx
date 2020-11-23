import { style } from 'typestyle';
import { cssClass } from './styleFunctions';

const baseFontSize = 'calc(10px + 2vmin)';
const headerFontSize = 'calc(10px + 5vmin)';
const footerFontSize = 'calc(8px + 1vmin)';

export const AppStyle = cssClass('AppContainer', {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  fontFamily: 'Verdana, Helvetica, Arial, sans-serif',
  fontSize: baseFontSize,
  $nest: {
    h1: {
      fontSize: headerFontSize,
    },
    a: {
      textDecoration: 'none',
      $nest: {
        '&:hover': {
          textDecoration: 'underline',
        },
      },
    },
    button: {
      fontSize: baseFontSize,
      padding: '.5vmin',
    },
  },
});

export const FooterStyle = cssClass('AppFooter', {
  width: '100vw',
  fontSize: footerFontSize,
  display: 'flex',
  alignContent: 'center',
  whiteSpace: 'nowrap',
});

/**
 * Different color schemes for the app. Use http://colorsafe.co/ to find complementary colors with
 * proper contrast.
 */
export const ColorSchemes = [
  {
    $debugName: 'ColorScheme-Green',
    backgroundColor: '#076324',
    color: '#fefefe',
    $nest: {
      a: {
        color: '#fffacd',
      },
    },
  },
  {
    $debugName: 'ColorScheme-Puce',
    backgroundColor: '#542c3e',
    color: '#fefefe',
    $nest: {
      a: {
        color: '#fffacd',
      },
    },
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
  height: 'calc(12px + 1vmin)',
  width: 'calc(12px + 1vmin)',
  border: '2px solid #181818',
});
