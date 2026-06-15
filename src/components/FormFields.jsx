import { useState } from 'react';

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

export function TextareaField({ label, value, onChange, placeholder, rows = 4, className = '', action }) {
  return (
    <label className={`field wide ${className}`.trim()}>
      <span className="field-label-row">
        <span>{label}</span>
        {action}
      </span>
      <textarea
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

const phoneCountries = [
  { code: 'US', flag: '🇺🇸', name: 'United States', dialCode: '+1' },
  { code: 'KH', flag: '🇰🇭', name: 'Cambodia', dialCode: '+855' },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia', dialCode: '+60' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', dialCode: '+65' },
  { code: 'TH', flag: '🇹🇭', name: 'Thailand', dialCode: '+66' },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia', dialCode: '+62' },
  { code: 'VN', flag: '🇻🇳', name: 'Vietnam', dialCode: '+84' },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines', dialCode: '+63' },
  { code: 'CN', flag: '🇨🇳', name: 'China', dialCode: '+86' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', dialCode: '+81' },
  { code: 'KR', flag: '🇰🇷', name: 'South Korea', dialCode: '+82' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', dialCode: '+61' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', dialCode: '+44' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', dialCode: '+1' },
  { code: 'FR', flag: '🇫🇷', name: 'France', dialCode: '+33' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', dialCode: '+49' },
  { code: 'IN', flag: '🇮🇳', name: 'India', dialCode: '+91' },
];

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function PhoneField({ label, value, countryCode, placeholder = 'Phone number', onCountryChange = () => {}, onChange }) {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const parsedPhone = parsePhoneValue(value, countryCode);

  const updateCountry = (countryCode) => {
    const country = phoneCountries.find((item) => item.code === countryCode) ?? phoneCountries[0];
    onCountryChange(country.code);
    onChange(formatPhoneValue(country.dialCode, parsedPhone.localNumber));
    setIsCountryOpen(false);
  };

  const updateNumber = (localNumber) => {
    onChange(formatPhoneValue(parsedPhone.country.dialCode, localNumber));
  };

  return (
    <div className="field wide phone-field">
      <span>{label}</span>
      <div className="phone-input-row">
        <div className="country-picker">
          <button
            className="country-trigger"
            type="button"
            onClick={() => setIsCountryOpen((current) => !current)}
            aria-expanded={isCountryOpen}
            aria-label="Choose phone country"
          >
            <span className="country-flag" aria-hidden="true">
              {parsedPhone.country.flag}
            </span>
            <span className="country-code">{parsedPhone.country.dialCode}</span>
            <span className="country-caret" aria-hidden="true">
              v
            </span>
          </button>
          {isCountryOpen ? (
            <div className="country-menu" role="listbox" aria-label="Phone countries">
              {phoneCountries.map((country) => (
                <button
                  className={country.code === parsedPhone.country.code ? 'active' : ''}
                  type="button"
                  key={country.code}
                  onClick={() => updateCountry(country.code)}
                  role="option"
                  aria-selected={country.code === parsedPhone.country.code}
                >
                  <span aria-hidden="true">{country.flag}</span>
                  <span>{country.name}</span>
                  <strong>{country.dialCode}</strong>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <input
          type="tel"
          value={parsedPhone.localNumber}
          placeholder={placeholder}
          onChange={(event) => updateNumber(event.target.value)}
        />
      </div>
    </div>
  );
}

export function MonthField({ label, value, onChange, allowPresent = false }) {
  const selectedMonth = parseMonthValue(value);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [viewYear, setViewYear] = useState(selectedMonth?.year ?? new Date().getFullYear());
  const isPresent = value === 'Present';
  const displayValue = isPresent
    ? 'Current'
    : selectedMonth
      ? `${monthLabels[selectedMonth.month]} ${selectedMonth.year}`
      : 'Select month';

  const pickMonth = (month) => {
    onChange(`${viewYear}-${String(month + 1).padStart(2, '0')}`);
    setIsPickerOpen(false);
  };

  return (
    <div className={`field ${allowPresent ? 'month-field has-current-toggle' : 'month-field'}`}>
      <span>{label}</span>
      <div className="month-input-row">
        <div className="month-picker">
          <button
            className={selectedMonth || isPresent ? 'month-trigger has-value' : 'month-trigger'}
            type="button"
            onClick={() => {
              if (selectedMonth) {
                setViewYear(selectedMonth.year);
              }
              setIsPickerOpen((current) => !current);
            }}
            aria-expanded={isPickerOpen}
          >
            <span>{displayValue}</span>
            <span aria-hidden="true">v</span>
          </button>
          {isPickerOpen ? (
            <div className="month-menu" aria-label={`${label} month picker`}>
              <div className="month-menu-header">
                <button type="button" onClick={() => setViewYear((year) => year - 1)} aria-label="Previous year">
                  -
                </button>
                <strong>{viewYear}</strong>
                <button type="button" onClick={() => setViewYear((year) => year + 1)} aria-label="Next year">
                  +
                </button>
              </div>
              <div className="month-grid">
                {monthLabels.map((monthLabel, monthIndex) => {
                  const isSelected = selectedMonth?.year === viewYear && selectedMonth?.month === monthIndex;

                  return (
                    <button
                      className={isSelected ? 'active' : ''}
                      type="button"
                      key={monthLabel}
                      onClick={() => pickMonth(monthIndex)}
                    >
                      {monthLabel}
                    </button>
                  );
                })}
              </div>
              <button
                className="month-clear"
                type="button"
                onClick={() => {
                  onChange('');
                  setIsPickerOpen(false);
                }}
              >
                Clear date
              </button>
            </div>
          ) : null}
        </div>
        {allowPresent ? (
          <button
            className={isPresent ? 'current-toggle active' : 'current-toggle'}
            type="button"
            onClick={(event) => {
              event.preventDefault();
              onChange(isPresent ? '' : 'Present');
              setIsPickerOpen(false);
            }}
            aria-pressed={isPresent}
          >
            Current
          </button>
        ) : null}
      </div>
    </div>
  );
}

function parsePhoneValue(value, countryCode) {
  const rawValue = String(value ?? '').trim();
  const selectedCountry = phoneCountries.find((country) => country.code === countryCode);
  const matchedCountry = selectedCountry ?? phoneCountries.find((country) => rawValue.startsWith(country.dialCode));
  const country = matchedCountry ?? phoneCountries[0];
  const localNumber = rawValue.startsWith(country.dialCode)
    ? rawValue.slice(country.dialCode.length).trim()
    : rawValue;

  return { country, localNumber };
}

function formatPhoneValue(dialCode, localNumber) {
  const cleanNumber = String(localNumber ?? '').trim();
  return cleanNumber ? `${dialCode} ${cleanNumber}` : '';
}

function parseMonthValue(value) {
  const monthMatch = String(value ?? '').match(/^(\d{4})-(\d{2})$/);
  if (!monthMatch) return null;

  const month = Number(monthMatch[2]) - 1;
  if (month < 0 || month > 11) return null;

  return {
    year: Number(monthMatch[1]),
    month,
  };
}
