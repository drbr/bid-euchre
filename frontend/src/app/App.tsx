import { MuiThemeProvider } from '@material-ui/core/styles';
import { useEffect, useState } from 'react';
import FlexView from 'react-flexview/lib';
import { classes } from 'typestyle';
import {
  AppStyle,
  ColorSchemeClasses,
  ColorSchemes,
  ColorSwatchStyle,
  FooterStyle,
  MaterialUITheme,
} from '../style/AppStyle';
import {
  retrieveColorSchemeId,
  storeColorSchemeId,
} from '../uiHelpers/LocalStorageClient';

export function App(props: { children?: React.ReactChild }) {
  const [colorSchemeId, setColorSchemeId] = useState(retrieveColorSchemeId());

  function saveAndRenderColorScheme(x: number) {
    storeColorSchemeId(x);
    setColorSchemeId(x);
  }

  useEffect(() => {
    const newBackgroundColor = ColorSchemes[colorSchemeId].backgroundColor;
    document.body.style.backgroundColor = newBackgroundColor;
  }, [colorSchemeId]);

  return (
    <MuiThemeProvider theme={MaterialUITheme}>
      <div className={classes(AppStyle, ColorSchemeClasses[colorSchemeId])}>
        <FlexView grow>{props.children}</FlexView>
        <AppFooter
          colorScheme={colorSchemeId}
          setColorScheme={saveAndRenderColorScheme}
        ></AppFooter>
      </div>
    </MuiThemeProvider>
  );
}

function AppFooter(props: ColorSchemePickerProps) {
  return (
    <FlexView wrap className={FooterStyle}>
      <FlexView
        vAlignContent="center"
        style={{ marginRight: 'auto', padding: 10 }}
      >
        © 2020 Andrew Brandon-Rumman
      </FlexView>
      <div style={{ marginLeft: 'auto' }}>
        <ColorSchemePicker {...props} />
      </div>
    </FlexView>
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
      {ColorSchemes.map((scheme, i) => (
        <div
          key={i}
          className={ColorSwatchStyle}
          style={{
            backgroundColor: scheme.backgroundColor,
            marginLeft: '.5vmin',
          }}
          onClick={() => props.setColorScheme(i)}
        />
      ))}
    </FlexView>
  );
}
