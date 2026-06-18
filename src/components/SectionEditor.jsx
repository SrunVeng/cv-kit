import { Plus, Sparkles, Trash2 } from 'lucide-react';
import { Field, MonthField, TextareaField } from './FormFields.jsx';

function SectionEditor({
  title,
  eyebrow,
  icon: Icon,
  section,
  items,
  fields,
  onChange,
  onAdd,
  onRemove,
  onGenerateText,
  resumeContext,
  sampleItems = [],
}) {
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
              <button
                type="button"
                onClick={() => onRemove(section, item.id)}
                aria-label={`Remove ${title} ${index + 1}`}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="field-grid">
              {fields.map((field) => {
                const placeholder = getFieldPlaceholder(field, sampleItems[index] ?? sampleItems[0]);

                if (field.type === 'textarea') {
                  return (
                    <TextareaField
                      key={field.key}
                      label={field.label}
                      value={item[field.key]}
                      placeholder={placeholder}
                      rows={field.rows}
                      action={
                        onGenerateText ? (
                          <AiFieldButton
                            label={`Generate ${field.label}`}
                            onClick={() =>
                              onGenerateText({
                                type: `${section}-${field.key}`,
                                label: `${title} ${index + 1} ${field.label}`,
                                currentValue: item[field.key] ?? '',
                                context: {
                                  section,
                                  field: field.key,
                                  item,
                                  resume: resumeContext,
                                },
                                onApply: (text) => onChange(section, item.id, { [field.key]: text }),
                              })
                            }
                          />
                        ) : null
                      }
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
                      placeholder={placeholder}
                      rows={field.rows ?? 4}
                      action={
                        onGenerateText ? (
                          <AiFieldButton
                            label={`Generate ${field.label}`}
                            onClick={() =>
                              onGenerateText({
                                type: `${section}-${field.key}`,
                                label: `${title} ${index + 1} ${field.label}`,
                                currentValue: (item[field.key] ?? []).join('\n'),
                                context: {
                                  section,
                                  field: field.key,
                                  item,
                                  resume: resumeContext,
                                },
                                onApply: (text) =>
                                  onChange(section, item.id, {
                                    [field.key]: text
                                      .split('\n')
                                      .map((line) => line.replace(/^[-*•]\s*/, '').trim())
                                      .filter(Boolean),
                                  }),
                              })
                            }
                          />
                        ) : null
                      }
                      onChange={(value) =>
                        onChange(section, item.id, {
                          [field.key]: value.split('\n'),
                        })
                      }
                    />
                  );
                }

                if (field.type === 'month') {
                  return (
                    <MonthField
                      key={field.key}
                      label={field.label}
                      value={item[field.key]}
                      allowPresent={field.allowPresent}
                      onChange={(value) => onChange(section, item.id, { [field.key]: value })}
                    />
                  );
                }

                return (
                  <Field
                    key={field.key}
                    label={field.label}
                    value={item[field.key]}
                    placeholder={placeholder}
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

function getFieldPlaceholder(field, sampleItem) {
  const sampleValue = sampleItem?.[field.key];

  if (Array.isArray(sampleValue)) {
    return sampleValue.length ? sampleValue.join('\n') : field.placeholder ?? 'One bullet point per line';
  }

  return sampleValue || field.placeholder || 'Add details';
}

function AiFieldButton({ label, onClick }) {
  return (
    <button
      className="ai-field-button"
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      title={label}
    >
      <Sparkles size={14} aria-hidden="true" />
      <span>Suggest</span>
    </button>
  );
}

export default SectionEditor;
