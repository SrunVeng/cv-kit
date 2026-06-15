import { Plus, X } from 'lucide-react';
import { useState } from 'react';

function TagEditor({ title, eyebrow, tags, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  const addTag = () => {
    const value = draft.trim();
    if (!value || tags.includes(value)) return;
    onChange([...tags, value]);
    setDraft('');
  };

  const updateTag = (index, value) => {
    onChange(tags.map((tag, tagIndex) => (tagIndex === index ? value : tag)));
  };

  const cleanTags = () => {
    onChange(tags.map((tag) => tag.trim()).filter(Boolean));
  };

  return (
    <section className="editor-section" aria-labelledby={`${title}-heading`}>
      <div className="section-title-row">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${title}-heading`}>{title}</h2>
        </div>
      </div>

      <div className="tag-list">
        {tags.map((tag, index) => (
          <span className="tag-chip editable" key={`${title}-${index}`}>
            <input
              type="text"
              value={tag}
              size={Math.max(4, tag.length || title.length)}
              aria-label={`${title} ${index + 1}`}
              onBlur={cleanTags}
              onChange={(event) => updateTag(index, event.target.value)}
            />
            <button
              type="button"
              onClick={() => onChange(tags.filter((_, tagIndex) => tagIndex !== index))}
              title={`Remove ${tag}`}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>

      <div className="inline-add">
        <input
          type="text"
          value={draft}
          placeholder={placeholder || `Add ${title.toLowerCase()}`}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag();
            }
          }}
        />
        <button type="button" onClick={addTag}>
          <Plus size={16} aria-hidden="true" />
          <span>Add</span>
        </button>
      </div>
    </section>
  );
}

export default TagEditor;
