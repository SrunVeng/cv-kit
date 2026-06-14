export function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function TextareaField({ label, value, onChange, placeholder, rows = 4, className = '' }) {
  return (
    <label className={`field wide ${className}`.trim()}>
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
