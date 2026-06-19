import { HeartHandshake } from 'lucide-react';
import logo from '../assets/khmer-cv-logo-user-small.png';

function TopBar({ onDonate, onDonateIntent }) {
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

      <button
        className="donation-trigger"
        type="button"
        onClick={onDonate}
        onPointerEnter={onDonateIntent}
        onFocus={onDonateIntent}
      >
        <span className="donation-trigger-icon" aria-hidden="true">
          <HeartHandshake size={20} />
        </span>
        <span className="donation-trigger-copy">
          <strong>Support Khmer-CV</strong>
          <small>Keep the builder free</small>
        </span>
      </button>
    </header>
  );
}

export default TopBar;
