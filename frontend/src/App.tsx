import { classes } from 'typestyle';
import { AppRouter } from './routing/AppRouter';
import { AppStyle, ColorSchemes } from './style/AppStyle';

export default function App() {
  return (
    <div className={classes(AppStyle, ColorSchemes[1])}>
      <AppRouter />
    </div>
  );
}
