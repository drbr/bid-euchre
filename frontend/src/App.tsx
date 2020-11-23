import { useState } from 'react';
import FlexView from 'react-flexview';
import { classes } from 'typestyle';
import { AppRouter } from './routing/AppRouter';
import {
  AppStyle,
  ColorSchemeClasses,
  ColorSchemes,
  ColorSwatchStyle,
  FooterStyle,
} from './style/AppStyle';

export default function App() {
  const [colorSchemeId, setColorSchemeId] = useState(retrieveColorSchemeId());

  function saveAndRenderColorScheme(x: number) {
    saveColorSchemeId(x);
    setColorSchemeId(x);
  }

  return (
    <div className={classes(AppStyle, ColorSchemeClasses[colorSchemeId])}>
      <FlexView grow vAlignContent="center">
        <AppRouter />
      </FlexView>
      <FlexView>
        <AppFooter
          colorScheme={colorSchemeId}
          setColorScheme={saveAndRenderColorScheme}
        />
      </FlexView>
    </div>
  );
}

function AppFooter(props: ColorSchemePickerProps) {
  return (
    <div className={FooterStyle}>
      <FlexView
        vAlignContent="center"
        style={{ marginRight: 'auto ', padding: 10 }}
      >
        © 2020 Andrew Brandon-Rumman
      </FlexView>
      <div style={{ marginLeft: 'auto' }}>
        <ColorSchemePicker {...props} />
      </div>
    </div>
  );
}

type ColorSchemePickerProps = {
  colorScheme: number;
  setColorScheme: (x: number) => void;
};

function ColorSchemePicker(props: ColorSchemePickerProps) {
  return (
    <FlexView
      vAlignContent="center"
      style={{ marginLeft: 'auto', padding: 10 }}
    >
      Choose color scheme:
      {ColorSchemes.map((scheme, i) => (
        <div
          key={i}
          className={ColorSwatchStyle}
          style={{ backgroundColor: scheme.backgroundColor, marginLeft: 5 }}
          onClick={() => props.setColorScheme(i)}
        />
      ))}
    </FlexView>
  );
}

function retrieveColorSchemeId(): number {
  const rawStorageValue = localStorage.getItem('colorSchemeId');
  return Number(rawStorageValue) || 0;
}

function saveColorSchemeId(i: number) {
  localStorage.setItem('colorSchemeId', String(i));
}
