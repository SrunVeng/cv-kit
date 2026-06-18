import { Check, ChevronDown, Eye, LayoutTemplate, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const categoryMenuRef = useRef(null);
  const holdTimerRef = useRef(null);
  const suppressResetTimerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const activeCategoryData = categories.find((category) => category.name === activeCategory);

  useEffect(() => {
    if (activeTemplate?.category) {
      setActiveCategory(activeTemplate.category);
    }
  }, [activeTemplate?.category]);

  useEffect(() => {
    if (!isCategoryMenuOpen) return undefined;

    const closeOnOutsidePress = (event) => {
      if (!categoryMenuRef.current?.contains(event.target)) {
        setIsCategoryMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsCategoryMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isCategoryMenuOpen]);

  useEffect(() => {
    if (!previewTemplate) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        closeTemplatePreview();
      }
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [previewTemplate]);

  useEffect(
    () => () => {
      window.clearTimeout(holdTimerRef.current);
      window.clearTimeout(suppressResetTimerRef.current);
    },
    [],
  );

  const closeTemplatePreview = () => {
    suppressClickRef.current = false;
    window.clearTimeout(suppressResetTimerRef.current);
    setPreviewTemplate(null);
  };

  const startTemplateHold = (template, event) => {
    if (event.button !== 0) return;

    window.clearTimeout(holdTimerRef.current);
    suppressClickRef.current = false;
    holdTimerRef.current = window.setTimeout(() => {
      suppressClickRef.current = true;
      setPreviewTemplate(template);
      navigator.vibrate?.(20);
      suppressResetTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 800);
    }, 450);
  };

  const cancelTemplateHold = () => {
    window.clearTimeout(holdTimerRef.current);
  };

  const selectTemplate = (template) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    onChange('templateId', template.id);
  };

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

      <div className="template-category-menu" ref={categoryMenuRef}>
        <button
          className="template-category-trigger"
          type="button"
          onClick={() => setIsCategoryMenuOpen((current) => !current)}
          aria-expanded={isCategoryMenuOpen}
          aria-haspopup="listbox"
          aria-controls="template-category-options"
        >
          <span className="template-category-trigger-icon" aria-hidden="true">
            <LayoutTemplate size={18} />
          </span>
          <span className="template-category-trigger-copy">
            <small>Template style</small>
            <strong>{activeCategory}</strong>
          </span>
          <span className="template-category-trigger-count">
            {activeCategoryData?.count ?? 0}
          </span>
          <ChevronDown
            className={isCategoryMenuOpen ? 'open' : ''}
            size={18}
            aria-hidden="true"
          />
        </button>

        {isCategoryMenuOpen ? (
          <div className="template-category-options" id="template-category-options" role="listbox">
            {categories.map((category) => {
              const isActive = category.name === activeCategory;

              return (
                <button
                  className={isActive ? 'active' : ''}
                  type="button"
                  key={category.name}
                  onClick={() => {
                    setActiveCategory(category.name);
                    setIsCategoryMenuOpen(false);
                  }}
                  role="option"
                  aria-selected={isActive}
                >
                  <span>
                    <strong>{category.name}</strong>
                    <small>{category.count} templates</small>
                  </span>
                  {isActive ? <Check size={18} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="template-grid">
        {visibleTemplates.map((template) => (
          <button
            className={`template-option ${template.id === activeTemplateId ? 'active' : ''}`}
            type="button"
            key={template.id}
            onClick={() => selectTemplate(template)}
            onDoubleClick={() => setPreviewTemplate(template)}
            onPointerDown={(event) => startTemplateHold(template, event)}
            onPointerUp={cancelTemplateHold}
            onPointerCancel={cancelTemplateHold}
            onPointerLeave={cancelTemplateHold}
            onContextMenu={(event) => event.preventDefault()}
            aria-pressed={template.id === activeTemplateId}
            title="Hold to preview"
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
              <span className="template-hold-hint">
                <Eye size={13} aria-hidden="true" />
                Hold to preview
              </span>
            </span>
          </button>
        ))}
      </div>

      {previewTemplate ? (
        <div
          className="template-preview-backdrop"
          role="presentation"
          onClick={closeTemplatePreview}
        >
          <section
            className="template-preview-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-preview-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="template-preview-dialog-header">
              <div>
                <p className="eyebrow">Template preview</p>
                <h2 id="template-preview-title">{previewTemplate.name}</h2>
              </div>
              <button
                type="button"
                onClick={closeTemplatePreview}
                aria-label="Close template preview"
                autoFocus
              >
                <X size={19} aria-hidden="true" />
              </button>
            </header>

            <div className="template-large-preview-stage">
              <ResumePreview
                resume={resume}
                style={{ ...style, templateId: previewTemplate.id }}
                template={previewTemplate}
              />
            </div>

            <button
              className="template-preview-use-button"
              type="button"
              onClick={() => {
                onChange('templateId', previewTemplate.id);
                closeTemplatePreview();
              }}
            >
              Use this template
            </button>
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default TemplatePicker;
