import logo from './style/logo.svg';
import './style/App.css';
import { NewGameUI } from './splash/NewGameScreen';

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Play Bid Euchre!</h1>
        <NewGameUI />
      </header>
    </div>
  );
}
