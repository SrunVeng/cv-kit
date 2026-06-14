import { useMemo, useRef, useState } from 'react';
import {
  Award,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  FolderKanban,
  GraduationCap,
  ImagePlus,
  RefreshCcw,
  Upload,
  UserRound,
} from 'lucide-react';
import { Field, TextareaField } from './components/FormFields.jsx';
import ResumePreview from './components/ResumePreview.jsx';
import SectionEditor from './components/SectionEditor.jsx';
import StyleControls from './components/StyleControls.jsx';
import TagEditor from './components/TagEditor.jsx';
import TemplatePicker from './components/TemplatePicker.jsx';
import TopBar from './components/TopBar.jsx';
import { sampleResume } from './data/sampleResume.js';
import { templates } from './data/templates.js';
import { downloadResumePdf, exportResumeJson, readResumeJson } from './utils/export.js';
import { createEntry, normalizeImportedResume } from './utils/resume.js';

const defaultStyle = {
  templateId: 'modern',
  accentColor: '#0f766e',
  fontPairing: 'sans',
  density: 'comfortable',
};

const wizardSteps = [
  { id: 'template', label: 'Template', eyebrow: 'Start', title: 'Choose template' },
  { id: 'identity', label: 'Name', eyebrow: 'Identity', title: 'Name and headline' },
  { id: 'contact', label: 'Contact', eyebrow: 'Reach', title: 'Contact details' },
  { id: 'summary', label: 'Profile', eyebrow: 'Intro', title: 'Professional profile' },
  { id: 'skills', label: 'Skills', eyebrow: 'Capabilities', title: 'Skills and languages' },
  { id: 'experience', label: 'Work', eyebrow: 'Experience', title: 'Work history' },
  { id: 'education', label: 'Education', eyebrow: 'Learning', title: 'Education' },
  { id: 'extras', label: 'Extras', eyebrow: 'Portfolio', title: 'Projects and certificates' },
  { id: 'style', label: 'Style', eyebrow: 'Design', title: 'Visual style' },
  { id: 'preview', label: 'Preview', eyebrow: 'Finish', title: 'Preview and download' },
];

const sectionConfigs = {
  experience: {
    section: 'experience',
    title: 'Experience',
    eyebrow: 'Work',
    icon: BriefcaseBusiness,
    fields: [
      { key: 'role', label: 'Role' },
      { key: 'company', label: 'Company' },
      { key: 'location', label: 'Location' },
      { key: 'start', label: 'Start' },
      { key: 'end', label: 'End' },
      { key: 'summary', label: 'Summary', type: 'textarea', rows: 3 },
      { key: 'highlights', label: 'Highlights', type: 'list', rows: 4 },
    ],
  },
  education: {
    section: 'education',
    title: 'Education',
    eyebrow: 'Learning',
    icon: GraduationCap,
    fields: [
      { key: 'degree', label: 'Degree' },
      { key: 'school', label: 'School' },
      { key: 'location', label: 'Location' },
      { key: 'start', label: 'Start' },
      { key: 'end', label: 'End' },
      { key: 'summary', label: 'Summary', type: 'textarea', rows: 3 },
    ],
  },
  projects: {
    section: 'projects',
    title: 'Projects',
    eyebrow: 'Portfolio',
    icon: FolderKanban,
    fields: [
      { key: 'name', label: 'Project name' },
      { key: 'role', label: 'Role' },
      { key: 'start', label: 'Start' },
      { key: 'end', label: 'End' },
      { key: 'summary', label: 'Summary', type: 'textarea', rows: 3 },
      { key: 'highlights', label: 'Highlights', type: 'list', rows: 3 },
    ],
  },
  certifications: {
    section: 'certifications',
    title: 'Certifications',
    eyebrow: 'Proof',
    icon: Award,
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'issuer', label: 'Issuer' },
      { key: 'year', label: 'Year' },
    ],
  },
};

function App() {
  const [resume, setResume] = useState(sampleResume);
  const [style, setStyle] = useState(defaultStyle);
  const [isExporting, setIsExporting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const previewRef = useRef(null);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === style.templateId) ?? templates[0],
    [style.templateId],
  );

  const currentStepData = wizardSteps[currentStep];
  const isPreviewStep = currentStepData.id === 'preview';
  const showSidePreview = !['template', 'preview'].includes(currentStepData.id);
  const progressPercent = ((currentStep + 1) / wizardSteps.length) * 100;

  const updatePersonal = (field, value) => {
    setResume((current) => ({
      ...current,
      personal: {
        ...current.personal,
        [field]: value,
      },
    }));
  };

  const updateStyle = (field, value) => {
    setStyle((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateItem = (section, id, patch) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const addItem = (section) => {
    setResume((current) => ({
      ...current,
      [section]: [...current[section], createEntry(section)],
    }));
  };

  const removeItem = (section, id) => {
    setResume((current) => ({
      ...current,
      [section]: current[section].filter((item) => item.id !== id),
    }));
  };

  const updateTags = (section, tags) => {
    setResume((current) => ({
      ...current,
      [section]: tags,
    }));
  };

  const handlePhotoUpload = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => updatePersonal('photo', reader.result);
    reader.readAsDataURL(file);
  };

  const handleImportJson = async (file) => {
    if (!file) return;

    const imported = await readResumeJson(file);
    setResume(normalizeImportedResume(imported.resume));
    if (imported.style) {
      setStyle((current) => ({ ...current, ...imported.style }));
    }
    setCurrentStep(wizardSteps.length - 1);
  };

  const handleExportPdf = async () => {
    if (!previewRef.current || isExporting) return;

    try {
      setIsExporting(true);
      await downloadResumePdf(previewRef.current, resume.personal.fullName || 'resume');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = () => {
    exportResumeJson({ resume, style }, resume.personal.fullName || 'resume');
  };

  const handleReset = () => {
    setResume(sampleResume);
    setStyle(defaultStyle);
    setCurrentStep(0);
  };

  const goBack = () => {
    setCurrentStep((step) => Math.max(0, step - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    setCurrentStep((step) => Math.min(wizardSteps.length - 1, step + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const jumpToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const topActions = [
    ...(isPreviewStep
      ? [
          {
            label: isExporting ? 'Preparing PDF' : 'Download PDF',
            shortLabel: 'PDF',
            icon: Download,
            onClick: handleExportPdf,
            disabled: isExporting,
            variant: 'primary',
          },
        ]
      : []),
    {
      label: 'Export JSON',
      shortLabel: 'JSON',
      icon: FileDown,
      onClick: handleExportJson,
    },
    {
      label: 'Import',
      icon: Upload,
      fileAccept: 'application/json',
      onFile: handleImportJson,
    },
    {
      label: 'Reset',
      icon: RefreshCcw,
      onClick: handleReset,
    },
  ];

  return (
    <div className="app-shell">
      <TopBar actions={topActions} />

      <main className="wizard-layout">
        <aside className="wizard-sidebar" aria-label="Resume steps">
          <div className="wizard-progress">
            <p className="eyebrow">
              Step {currentStep + 1} of {wizardSteps.length}
            </p>
            <h2>{currentStepData.title}</h2>
            <div className="wizard-progress-bar" aria-hidden="true">
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="wizard-step-list">
            {wizardSteps.map((step, index) => (
              <button
                className={[
                  'wizard-step-button',
                  index === currentStep ? 'active' : '',
                  index < currentStep ? 'complete' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                key={step.id}
                onClick={() => jumpToStep(index)}
                aria-current={index === currentStep ? 'step' : undefined}
              >
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="wizard-main" aria-labelledby="wizard-heading">
          <header className="wizard-heading">
            <p className="eyebrow">{currentStepData.eyebrow}</p>
            <h1 id="wizard-heading">{currentStepData.title}</h1>
          </header>

          <div className={`wizard-step-content ${showSidePreview ? 'with-preview' : ''}`}>
            <div className="wizard-editor-column">
              {renderStepContent({
                activeTemplate,
                currentStepId: currentStepData.id,
                handleExportPdf,
                handlePhotoUpload,
                isExporting,
                previewRef,
                resume,
                style,
                updateItem,
                updatePersonal,
                updateStyle,
                updateTags,
                addItem,
                removeItem,
              })}
            </div>

            {showSidePreview ? (
              <aside className="wizard-preview-rail" aria-label="Live resume preview">
                <div className="preview-toolbar compact">
                  <div>
                    <p className="eyebrow">Preview</p>
                    <h2>{activeTemplate.name}</h2>
                  </div>
                  <span className="template-pill">{activeTemplate.tone}</span>
                </div>
                <div className="preview-stage rail-preview-stage">
                  <ResumePreview resume={resume} style={style} template={activeTemplate} />
                </div>
              </aside>
            ) : null}
          </div>

          <nav className="wizard-footer" aria-label="Step navigation">
            <button className="wizard-nav-button" type="button" onClick={goBack} disabled={currentStep === 0}>
              <ChevronLeft size={18} aria-hidden="true" />
              <span>Back</span>
            </button>
            {isPreviewStep ? (
              <button
                className="wizard-nav-button primary"
                type="button"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                <Download size={18} aria-hidden="true" />
                <span>{isExporting ? 'Preparing PDF' : 'Download PDF'}</span>
              </button>
            ) : (
              <button className="wizard-nav-button primary" type="button" onClick={goNext}>
                <span>Next</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            )}
          </nav>
        </section>
      </main>
    </div>
  );
}

function renderStepContent({
  activeTemplate,
  currentStepId,
  handleExportPdf,
  handlePhotoUpload,
  isExporting,
  previewRef,
  resume,
  style,
  updateItem,
  updatePersonal,
  updateStyle,
  updateTags,
  addItem,
  removeItem,
}) {
  switch (currentStepId) {
    case 'template':
      return (
        <TemplatePicker
          templates={templates}
          activeTemplateId={style.templateId}
          onChange={updateStyle}
          resume={resume}
          style={style}
        />
      );
    case 'identity':
      return (
        <section className="editor-section" aria-labelledby="identity-heading">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Identity</p>
              <h2 id="identity-heading">Name</h2>
            </div>
          </div>
          <PhotoUploader personal={resume.personal} onPhotoUpload={handlePhotoUpload} />
          <div className="field-grid">
            <Field label="Full name" value={resume.personal.fullName} onChange={(value) => updatePersonal('fullName', value)} />
            <Field label="Headline" value={resume.personal.headline} onChange={(value) => updatePersonal('headline', value)} />
          </div>
        </section>
      );
    case 'contact':
      return (
        <section className="editor-section" aria-labelledby="contact-heading">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Reach</p>
              <h2 id="contact-heading">Contact</h2>
            </div>
          </div>
          <div className="field-grid">
            <Field label="Email" value={resume.personal.email} onChange={(value) => updatePersonal('email', value)} />
            <Field label="Phone" value={resume.personal.phone} onChange={(value) => updatePersonal('phone', value)} />
            <Field label="Location" value={resume.personal.location} onChange={(value) => updatePersonal('location', value)} />
            <Field label="Website" value={resume.personal.website} onChange={(value) => updatePersonal('website', value)} />
          </div>
        </section>
      );
    case 'summary':
      return (
        <section className="editor-section" aria-labelledby="summary-heading">
          <div className="section-title-row">
            <div>
              <p className="eyebrow">Intro</p>
              <h2 id="summary-heading">Profile</h2>
            </div>
          </div>
          <div className="field-grid">
            <TextareaField
              label="Professional summary"
              value={resume.personal.summary}
              onChange={(value) => updatePersonal('summary', value)}
              rows={7}
              className="profile-summary-field"
            />
          </div>
        </section>
      );
    case 'skills':
      return (
        <>
          <TagEditor
            title="Skills"
            eyebrow="Capabilities"
            tags={resume.skills}
            onChange={(tags) => updateTags('skills', tags)}
          />
          <TagEditor
            title="Languages"
            eyebrow="Communication"
            tags={resume.languages}
            onChange={(tags) => updateTags('languages', tags)}
          />
        </>
      );
    case 'experience':
      return (
        <SectionEditor
          {...sectionConfigs.experience}
          items={resume.experience}
          onChange={updateItem}
          onAdd={addItem}
          onRemove={removeItem}
        />
      );
    case 'education':
      return (
        <SectionEditor
          {...sectionConfigs.education}
          items={resume.education}
          onChange={updateItem}
          onAdd={addItem}
          onRemove={removeItem}
        />
      );
    case 'extras':
      return (
        <>
          <SectionEditor
            {...sectionConfigs.projects}
            items={resume.projects}
            onChange={updateItem}
            onAdd={addItem}
            onRemove={removeItem}
          />
          <SectionEditor
            {...sectionConfigs.certifications}
            items={resume.certifications}
            onChange={updateItem}
            onAdd={addItem}
            onRemove={removeItem}
          />
        </>
      );
    case 'style':
      return <StyleControls style={style} onChange={updateStyle} />;
    case 'preview':
      return (
        <section className="preview-workspace wizard-preview-workspace" aria-label="Resume preview">
          <div className="preview-toolbar">
            <div>
              <p className="eyebrow">Live Preview</p>
              <h2>{activeTemplate.name}</h2>
            </div>
            <span className="template-pill">{activeTemplate.tone}</span>
          </div>
          <div className="preview-stage wizard-preview-stage">
            <ResumePreview ref={previewRef} resume={resume} style={style} template={activeTemplate} />
          </div>
          <div className="preview-download-row">
            <button className="wizard-nav-button primary" type="button" onClick={handleExportPdf} disabled={isExporting}>
              <Download size={18} aria-hidden="true" />
              <span>{isExporting ? 'Preparing PDF' : 'Download PDF'}</span>
            </button>
          </div>
        </section>
      );
    default:
      return null;
  }
}

function PhotoUploader({ personal, onPhotoUpload }) {
  return (
    <label className="photo-uploader">
      <span className="photo-frame">
        {personal.photo ? (
          <img src={personal.photo} alt="" />
        ) : (
          <span className="photo-placeholder" aria-hidden="true">
            <UserRound size={34} />
          </span>
        )}
      </span>
      <span>
        <strong>Upload photo</strong>
        <small>PNG, JPG, or WEBP</small>
      </span>
      <ImagePlus size={20} aria-hidden="true" />
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(event) => {
          onPhotoUpload(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
    </label>
  );
}

export default App;
