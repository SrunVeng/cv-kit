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
          const className = `action-button ${action.variant === 'primary' ? 'primary' : ''}`;

          if (action.fileAccept) {
            return (
              <label className={className} key={action.label} title={action.label}>
                <Icon size={18} aria-hidden="true" />
                <span data-short-label={action.shortLabel || action.label}>{action.label}</span>
                <input
                  type="file"
                  accept={action.fileAccept}
                  onChange={(event) => {
                    action.onFile(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
              </label>
            );
          }

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
