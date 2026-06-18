import { HeartHandshake } from 'lucide-react';
import logo from '../assets/khmer-cv-logo.png';

function TopBar({ onDonate }) {
  return (
    <header className="top-bar">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          <img src={logo} alt="" width="44" height="44" />
        </span>
        <div>
          <p className="eyebrow">Khmer-CV</p>
          <h1>CV Builder</h1>
        </div>
      </div>

      <button className="donation-trigger" type="button" onClick={onDonate}>
        <HeartHandshake size={18} aria-hidden="true" />
        <span>Donate</span>
      </button>
    </header>
  );
}

export default TopBar;
