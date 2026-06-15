import { FileText } from 'lucide-react';

function TopBar({ actions }) {
  return (
    <header className="top-bar">
      <div className="brand-lockup">
        <span className="brand-mark" aria-hidden="true">
          <FileText size={22} />
        </span>
        <div>
          <p className="eyebrow">CraftCV</p>
          <h1>Resume Builder</h1>
        </div>
      </div>

      <div className="top-actions" aria-label="Document actions">
        {actions.map((action) => {
          const Icon = action.icon;
          const className = ['action-button', action.variant].filter(Boolean).join(' ');

          return (
            <button
              className={className}
              type="button"
              key={action.label}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.label}
            >
              <Icon size={18} aria-hidden="true" />
              <span data-short-label={action.shortLabel || action.label}>{action.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

export default TopBar;
