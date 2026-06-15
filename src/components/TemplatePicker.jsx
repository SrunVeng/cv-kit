import { useEffect, useMemo, useState } from 'react';
import ResumePreview from './ResumePreview.jsx';

function TemplatePicker({ templates, activeTemplateId, onChange, resume, style }) {
  const categories = useMemo(() => {
    const grouped = templates.reduce((accumulator, template) => {
      const category = template.category || 'Other';
      accumulator[category] = (accumulator[category] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(grouped).map(([name, count]) => ({ name, count }));
  }, [templates]);

  const activeTemplate = templates.find((template) => template.id === activeTemplateId) ?? templates[0];
  const [activeCategory, setActiveCategory] = useState(activeTemplate.category || categories[0]?.name);

  useEffect(() => {
    if (activeTemplate?.category) {
      setActiveCategory(activeTemplate.category);
    }
  }, [activeTemplate?.category]);

  const visibleTemplates = templates.filter((template) => template.category === activeCategory);

  return (
    <section className="editor-section template-picker-section" aria-labelledby="templates-heading">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Layouts</p>
          <h2 id="templates-heading">Templates</h2>
        </div>
      </div>

      <div className="template-category-tabs" aria-label="Template categories">
        {categories.map((category) => (
          <button
            className={category.name === activeCategory ? 'active' : ''}
            type="button"
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            aria-pressed={category.name === activeCategory}
          >
            <span>{category.name}</span>
            <strong>{category.count}</strong>
          </button>
        ))}
      </div>

      <div className="template-grid">
        {visibleTemplates.map((template) => (
          <button
            className={`template-option ${template.id === activeTemplateId ? 'active' : ''}`}
            type="button"
            key={template.id}
            onClick={() => onChange('templateId', template.id)}
            aria-pressed={template.id === activeTemplateId}
          >
            <span className="template-preview-frame" aria-hidden="true">
              <span className="template-preview-scale">
                <ResumePreview resume={resume} style={{ ...style, templateId: template.id }} template={template} />
              </span>
            </span>
            <span className="template-card-copy">
              <span>
                <strong>{template.name}</strong>
                <small>{template.description}</small>
              </span>
              <em>{template.tone}</em>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default TemplatePicker;
