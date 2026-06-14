import ResumePreview from './ResumePreview.jsx';

function TemplatePicker({ templates, activeTemplateId, onChange, resume, style }) {
  return (
    <section className="editor-section" aria-labelledby="templates-heading">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Layouts</p>
          <h2 id="templates-heading">Templates</h2>
        </div>
      </div>

      <div className="template-grid">
        {templates.map((template) => (
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
              <strong>{template.name}</strong>
              <span>{template.tone}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default TemplatePicker;
