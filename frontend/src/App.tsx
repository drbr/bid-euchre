import './style/App.css';
import { AppRouter } from './routing/AppRouter';

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <AppRouter />
      </header>
    </div>
  );
}
