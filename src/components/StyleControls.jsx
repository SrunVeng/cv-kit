import { Paintbrush, Rows3, Type } from 'lucide-react';
import { colorPalette, densityOptions, fontPairings } from '../data/templates.js';

function StyleControls({ style, onChange }) {
  return (
    <section className="editor-section" aria-labelledby="style-heading">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Design</p>
          <h2 id="style-heading">Style</h2>
        </div>
      </div>

      <div className="control-group">
        <div className="control-label">
          <Paintbrush size={17} aria-hidden="true" />
          <span>Accent color</span>
        </div>
        <div className="swatch-row">
          {colorPalette.map((color) => (
            <button
              className={`color-swatch ${style.accentColor === color ? 'active' : ''}`}
              type="button"
              key={color}
              style={{ '--swatch': color }}
              onClick={() => onChange('accentColor', color)}
              title={`Use ${color}`}
              aria-label={`Use ${color}`}
            />
          ))}
          <label className="custom-color" title="Choose custom color">
            <input
              type="color"
              value={style.accentColor}
              onChange={(event) => onChange('accentColor', event.target.value)}
              aria-label="Choose custom color"
            />
          </label>
        </div>
      </div>

      <div className="control-group">
        <div className="control-label">
          <Type size={17} aria-hidden="true" />
          <span>Typeface</span>
        </div>
        <div className="segmented-control">
          {fontPairings.map((font) => (
            <button
              type="button"
              key={font.id}
              className={style.fontPairing === font.id ? 'active' : ''}
              onClick={() => onChange('fontPairing', font.id)}
              title={font.description}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div className="control-label">
          <Rows3 size={17} aria-hidden="true" />
          <span>Density</span>
        </div>
        <div className="segmented-control">
          {densityOptions.map((option) => (
            <button
              type="button"
              key={option.id}
              className={style.density === option.id ? 'active' : ''}
              onClick={() => onChange('density', option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StyleControls;
