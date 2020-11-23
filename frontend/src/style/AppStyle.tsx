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

export const ColorSchemes = [
  cssClass('ColorScheme-Green', {
    backgroundColor: '#076324',
    color: '#fefefe',
  }),
  cssClass('ColorScheme-Puce', {
    backgroundColor: '#542c3e',
    color: '#fefefe',
  }),
];
