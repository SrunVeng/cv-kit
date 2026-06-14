import { Plus, Trash2 } from 'lucide-react';
import { Field, TextareaField } from './FormFields.jsx';

function SectionEditor({ title, eyebrow, icon: Icon, section, items, fields, onChange, onAdd, onRemove }) {
  return (
    <section className="editor-section" aria-labelledby={`${section}-heading`}>
      <div className="section-title-row">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${section}-heading`}>
            {Icon ? <Icon size={18} aria-hidden="true" /> : null}
            {title}
          </h2>
        </div>
        <button className="icon-text-button" type="button" onClick={() => onAdd(section)}>
          <Plus size={16} aria-hidden="true" />
          <span>Add</span>
        </button>
      </div>

      <div className="entry-stack">
        {items.map((item, index) => (
          <article className="editor-item" key={item.id}>
            <div className="item-heading">
              <strong>
                {title} {index + 1}
              </strong>
              <button type="button" onClick={() => onRemove(section, item.id)} title={`Remove ${title} ${index + 1}`}>
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="field-grid">
              {fields.map((field) => {
                if (field.type === 'textarea') {
                  return (
                    <TextareaField
                      key={field.key}
                      label={field.label}
                      value={item[field.key]}
                      rows={field.rows}
                      onChange={(value) => onChange(section, item.id, { [field.key]: value })}
                    />
                  );
                }

                if (field.type === 'list') {
                  return (
                    <TextareaField
                      key={field.key}
                      label={field.label}
                      value={(item[field.key] ?? []).join('\n')}
                      rows={field.rows ?? 4}
                      onChange={(value) =>
                        onChange(section, item.id, {
                          [field.key]: value.split('\n'),
                        })
                      }
                    />
                  );
                }

                return (
                  <Field
                    key={field.key}
                    label={field.label}
                    value={item[field.key]}
                    placeholder={field.placeholder}
                    onChange={(value) => onChange(section, item.id, { [field.key]: value })}
                  />
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default SectionEditor;
