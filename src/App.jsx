import {
  lazy,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Award,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Download,
  FolderKanban,
  GraduationCap,
  ImagePlus,
  RefreshCcw,
  Sparkles,
  Trash2,
  UserRound,
} from 'lucide-react';
import { Field, PhoneField, TextareaField } from './components/FormFields.jsx';
import AppFooter from './components/AppFooter.jsx';
import ResumePreview from './components/ResumePreview.jsx';
import TemplatePicker from './components/TemplatePicker.jsx';
import TopBar from './components/TopBar.jsx';
import { sampleResume } from './data/sampleResume.js';
import { templates } from './data/templates.js';
import { generateResumeText, getSmartGeneratorName } from './utils/ai.js';
import { clearResumeDraft, loadResumeDraft, saveResumeDraft } from './utils/draft.js';
import { downloadResumePdf, preloadResumePdf } from './utils/export.js';
import { prepareProfilePhoto } from './utils/image.js';
import { createEmptyResume, createEntry } from './utils/resume.js';

const loadDonationDialog = () => import('./components/DonationDialog.jsx');
const DonationDialog = lazy(loadDonationDialog);
const SectionEditor = lazy(() => import('./components/SectionEditor.jsx'));
const StyleControls = lazy(() => import('./components/StyleControls.jsx'));
const TagEditor = lazy(() => import('./components/TagEditor.jsx'));

const defaultStyle = {
  templateId: 'modern',
  accentColor: '#0f766e',
  fontPairing: 'sans',
  density: 'comfortable',
};

const defaultAiAssistant = {
  isOpen: false,
  isLoading: false,
  error: '',
  result: '',
  tone: 'professional',
  length: 'medium',
  prompt: '',
  statusText: '',
  progress: null,
  config: null,
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
      { key: 'role', label: 'Role', placeholder: 'e.g. Senior Product Designer' },
      { key: 'company', label: 'Company', placeholder: 'e.g. Northstar Labs' },
      { key: 'location', label: 'Location', placeholder: 'e.g. Remote or Phnom Penh' },
      { key: 'start', label: 'Start date', type: 'month' },
      { key: 'end', label: 'End date', type: 'month', allowPresent: true },
      { key: 'summary', label: 'Summary', type: 'textarea', rows: 3, placeholder: 'Describe the role in one short sentence.' },
      { key: 'highlights', label: 'Highlights', type: 'list', rows: 4 },
    ],
  },
  education: {
    section: 'education',
    title: 'Education',
    eyebrow: 'Learning',
    icon: GraduationCap,
    fields: [
      { key: 'degree', label: 'Degree', placeholder: 'e.g. B.S. Computer Science' },
      { key: 'school', label: 'School', placeholder: 'e.g. University name' },
      { key: 'location', label: 'Location', placeholder: 'e.g. Phnom Penh, Cambodia' },
      { key: 'start', label: 'Start date', type: 'month' },
      { key: 'end', label: 'End date', type: 'month', allowPresent: true },
      { key: 'summary', label: 'Summary', type: 'textarea', rows: 3, placeholder: 'Add coursework, focus area, or honors.' },
    ],
  },
  projects: {
    section: 'projects',
    title: 'Projects',
    eyebrow: 'Portfolio',
    icon: FolderKanban,
    fields: [
      { key: 'name', label: 'Project name', placeholder: 'e.g. Portfolio Website' },
      { key: 'role', label: 'Role', placeholder: 'e.g. Designer and developer' },
      { key: 'start', label: 'Start date', type: 'month' },
      { key: 'end', label: 'End date', type: 'month', allowPresent: true },
      { key: 'summary', label: 'Summary', type: 'textarea', rows: 3, placeholder: 'Explain what the project does and why it matters.' },
      { key: 'highlights', label: 'Highlights', type: 'list', rows: 3 },
    ],
  },
  certifications: {
    section: 'certifications',
    title: 'Certifications',
    eyebrow: 'Proof',
    icon: Award,
    fields: [
      { key: 'title', label: 'Title', placeholder: 'e.g. AWS Certified Developer' },
      { key: 'issuer', label: 'Issuer', placeholder: 'e.g. Amazon Web Services' },
      { key: 'year', label: 'Year', placeholder: 'e.g. 2026' },
    ],
  },
};

function App() {
  const savedDraft = useMemo(() => loadResumeDraft(), []);
  const [resume, setResume] = useState(() => savedDraft?.resume ?? createEmptyResume());
  const [style, setStyle] = useState(() => savedDraft?.style ?? defaultStyle);
  const [interactedStyleFields, setInteractedStyleFields] = useState(
    () => savedDraft?.interactedStyleFields ?? {},
  );
  const [isPreviewComplete, setIsPreviewComplete] = useState(
    () => savedDraft?.isPreviewComplete ?? false,
  );
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [photoState, setPhotoState] = useState({ isProcessing: false, error: '' });
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [aiAssistant, setAiAssistant] = useState(defaultAiAssistant);
  const [currentStep, setCurrentStep] = useState(() => savedDraft?.currentStep ?? 0);
  const previewRef = useRef(null);
  const photoUploadIdRef = useRef(0);
  const deferredResume = useDeferredValue(resume);

  const activeTemplate = useMemo(
    () => templates.find((template) => template.id === style.templateId) ?? templates[0],
    [style.templateId],
  );

  const currentStepData = wizardSteps[currentStep];
  const isPreviewStep = currentStepData.id === 'preview';
  const showSidePreview = !['template', 'preview'].includes(currentStepData.id);
  const progressPercent = ((currentStep + 1) / wizardSteps.length) * 100;
  const completedSteps = useMemo(
    () => getCompletedSteps(resume, style, interactedStyleFields, isPreviewComplete),
    [resume, style, interactedStyleFields, isPreviewComplete],
  );
  const startedSteps = useMemo(
    () => getStartedSteps(resume, style, interactedStyleFields, isPreviewComplete),
    [resume, style, interactedStyleFields, isPreviewComplete],
  );
  const resumeContext = useMemo(() => getResumeContext(resume), [resume]);
  const getStepStatus = (stepId) => {
    if (completedSteps[stepId]) return 'complete';
    if (startedSteps[stepId]) return 'pending';
    return 'not started';
  };
  const openDonation = useCallback(() => setIsDonationOpen(true), []);
  const closeDonation = useCallback(() => setIsDonationOpen(false), []);
  const preloadDonation = useCallback(() => {
    loadDonationDialog().catch(() => {
      // Opening the dialog will retry if preloading fails.
    });
  }, []);
  const preloadPdfAssets = useCallback(() => {
    preloadResumePdf().catch(() => {
      // Export will retry naturally if preloading fails.
    });
  }, []);

  useEffect(() => {
    if (!isResetConfirmOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsResetConfirmOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isResetConfirmOpen]);

  useEffect(() => {
    if (!isPreviewStep) return undefined;

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preloadPdfAssets, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(preloadPdfAssets, 250);
    return () => window.clearTimeout(timeoutId);
  }, [isPreviewStep, preloadPdfAssets]);

  useEffect(() => {
    const saveTimeout = window.setTimeout(() => {
      saveResumeDraft({
        resume,
        style,
        interactedStyleFields,
        isPreviewComplete,
        currentStep,
      });
    }, 250);

    return () => window.clearTimeout(saveTimeout);
  }, [currentStep, interactedStyleFields, isPreviewComplete, resume, style]);

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
    setInteractedStyleFields((current) => (
      current[field] ? current : { ...current, [field]: true }
    ));

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

  const handlePhotoUpload = async (file) => {
    if (!file) return;

    const uploadId = ++photoUploadIdRef.current;
    setPhotoState({ isProcessing: true, error: '' });

    try {
      const optimizedPhoto = await prepareProfilePhoto(file);
      if (uploadId !== photoUploadIdRef.current) return;

      updatePersonal('photo', optimizedPhoto);
      setPhotoState({ isProcessing: false, error: '' });
    } catch (error) {
      if (uploadId !== photoUploadIdRef.current) return;

      setPhotoState({
        isProcessing: false,
        error: error?.message || 'Unable to prepare this image.',
      });
    }
  };

  const handleExportPdf = async () => {
    if (!previewRef.current || isExporting) return;

    try {
      setExportError('');
      setIsExporting(true);
      await downloadResumePdf(previewRef.current, resume.personal.fullName || 'resume');
      setIsPreviewComplete(true);
    } catch {
      setExportError('PDF creation failed. Please try again or use a smaller profile photo.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    photoUploadIdRef.current += 1;
    clearResumeDraft();
    setResume(createEmptyResume());
    setStyle(defaultStyle);
    setInteractedStyleFields({});
    setIsPreviewComplete(false);
    setExportError('');
    setPhotoState({ isProcessing: false, error: '' });
    setCurrentStep(0);
    setIsResetConfirmOpen(false);
  };

  const openAiAssistant = (config) => {
    setAiAssistant({
      ...defaultAiAssistant,
      isOpen: true,
      config,
    });
  };

  const closeAiAssistant = () => {
    if (aiAssistant.isLoading) return;
    setAiAssistant(defaultAiAssistant);
  };

  const handleGenerateText = async () => {
    if (!aiAssistant.config || aiAssistant.isLoading) return;

    try {
      setAiAssistant((current) => ({
        ...current,
        isLoading: true,
        error: '',
        statusText: 'Creating suggestion...',
        progress: 1,
      }));
      const text = await generateResumeText(
        {
          type: aiAssistant.config.type,
          label: aiAssistant.config.label,
          currentValue: aiAssistant.config.currentValue,
          context: aiAssistant.config.context,
          tone: aiAssistant.tone,
          length: aiAssistant.length,
          prompt: aiAssistant.prompt,
        },
        {
          onProgress: ({ text: statusText, progress }) => {
            setAiAssistant((current) => ({
              ...current,
              statusText: statusText || current.statusText,
              progress: typeof progress === 'number' ? progress : current.progress,
            }));
          },
        },
      );
      setAiAssistant((current) => ({
        ...current,
        isLoading: false,
        result: text,
        statusText: 'Suggestion ready.',
        progress: 1,
      }));
    } catch (error) {
      setAiAssistant((current) => ({
        ...current,
        isLoading: false,
        progress: null,
        statusText: '',
        error: error.message || 'Unable to generate text.',
      }));
    }
  };

  const handleApplyGeneratedText = () => {
    if (!aiAssistant.result.trim() || !aiAssistant.config?.onApply) return;
    aiAssistant.config.onApply(aiAssistant.result.trim());
    setAiAssistant(defaultAiAssistant);
  };

  const goBack = () => {
    const nextStep = Math.max(0, currentStep - 1);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goNext = () => {
    const nextStep = Math.min(wizardSteps.length - 1, currentStep + 1);
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const jumpToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <TopBar onDonate={openDonation} onDonateIntent={preloadDonation} />

      {isDonationOpen ? (
        <Suspense fallback={<DialogLoading />}>
          <DonationDialog isOpen onClose={closeDonation} />
        </Suspense>
      ) : null}

      {isResetConfirmOpen && (
        <div className="confirm-backdrop" role="presentation" onClick={() => setIsResetConfirmOpen(false)}>
          <section
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-confirm-title"
            aria-describedby="reset-confirm-description"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="confirm-icon danger" aria-hidden="true">
              <RefreshCcw size={22} />
            </span>
            <div className="confirm-copy">
              <p className="eyebrow">Reset CV</p>
              <h2 id="reset-confirm-title">Start over?</h2>
              <p id="reset-confirm-description">
                This will clear your current edits and return to a blank CV at step 1.
              </p>
            </div>
            <div className="confirm-actions">
              <button
                className="confirm-button subtle"
                type="button"
                autoFocus
                onClick={() => setIsResetConfirmOpen(false)}
              >
                No
              </button>
              <button className="confirm-button danger" type="button" onClick={handleReset}>
                Yes, reset
              </button>
            </div>
          </section>
        </div>
      )}

      {aiAssistant.isOpen ? (
        <AiAssistantDialog
          assistant={aiAssistant}
          onChange={setAiAssistant}
          onClose={closeAiAssistant}
          onGenerate={handleGenerateText}
          onApply={handleApplyGeneratedText}
        />
      ) : null}

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
                  completedSteps[step.id] ? 'complete' : '',
                  startedSteps[step.id] && !completedSteps[step.id] ? 'pending' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                type="button"
                key={step.id}
                onClick={() => jumpToStep(index)}
                aria-current={index === currentStep ? 'step' : undefined}
                aria-label={`${step.label}: ${getStepStatus(step.id)}`}
              >
                <span>{index + 1}</span>
                <strong>{step.label}</strong>
              </button>
            ))}
          </div>

          <button
            className="wizard-reset-button"
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
          >
            <RefreshCcw size={15} aria-hidden="true" />
            <span>Start over</span>
          </button>
        </aside>

        <section className="wizard-main" aria-labelledby="wizard-heading">
          <header className="wizard-heading">
            <p className="eyebrow">{currentStepData.eyebrow}</p>
            <h1 id="wizard-heading">{currentStepData.title}</h1>
          </header>

          <div className={`wizard-step-content ${showSidePreview ? 'with-preview' : ''}`}>
            <div className="wizard-editor-column">
              <Suspense fallback={<StepLoading />}>
                {renderStepContent({
                  activeTemplate,
                  currentStepId: currentStepData.id,
                  handlePhotoUpload,
                  photoState,
                  previewRef,
                  previewResume: deferredResume,
                  resume,
                  resumeContext,
                  style,
                  updateItem,
                  updatePersonal,
                  updateStyle,
                  updateTags,
                  addItem,
                  removeItem,
                  openAiAssistant,
                })}
              </Suspense>
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
                  <ResumePreview resume={deferredResume} style={style} template={activeTemplate} />
                </div>
              </aside>
            ) : null}
          </div>

          {isPreviewStep && exportError ? (
            <p className="export-error" role="alert">{exportError}</p>
          ) : null}

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
                onPointerEnter={preloadPdfAssets}
                onFocus={preloadPdfAssets}
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

      <AppFooter />
    </div>
  );
}

function StepLoading() {
  return (
    <div className="step-loading" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <p>Loading this step…</p>
    </div>
  );
}

function DialogLoading() {
  return (
    <div className="dialog-loading-backdrop" role="status" aria-live="polite">
      <div className="dialog-loading">
        <span aria-hidden="true" />
        <p>Opening support options…</p>
      </div>
    </div>
  );
}

function renderStepContent({
  activeTemplate,
  currentStepId,
  handlePhotoUpload,
  photoState,
  previewRef,
  previewResume,
  resume,
  resumeContext,
  style,
  updateItem,
  updatePersonal,
  updateStyle,
  updateTags,
  addItem,
  removeItem,
  openAiAssistant,
}) {
  switch (currentStepId) {
    case 'template':
      return (
        <TemplatePicker
          templates={templates}
          activeTemplateId={style.templateId}
          onChange={updateStyle}
          resume={sampleResume}
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
          <PhotoUploader
            personal={resume.personal}
            onPhotoUpload={handlePhotoUpload}
            onRemovePhoto={() => updatePersonal('photo', '')}
            photoState={photoState}
          />
          <div className="field-grid">
            <Field
              label="Full name"
              value={resume.personal.fullName}
              placeholder={sampleResume.personal.fullName}
              onChange={(value) => updatePersonal('fullName', value)}
            />
            <Field
              label="Headline"
              value={resume.personal.headline}
              placeholder={sampleResume.personal.headline}
              onChange={(value) => updatePersonal('headline', value)}
            />
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
            <Field
              label="Email"
              value={resume.personal.email}
              placeholder={sampleResume.personal.email}
              onChange={(value) => updatePersonal('email', value)}
            />
            <PhoneField
              label="Phone"
              value={resume.personal.phone}
              placeholder="415 555 0184"
              countryCode={resume.personal.phoneCountry}
              onCountryChange={(value) => updatePersonal('phoneCountry', value)}
              onChange={(value) => updatePersonal('phone', value)}
            />
            <Field
              label="Location"
              value={resume.personal.location}
              placeholder={sampleResume.personal.location}
              onChange={(value) => updatePersonal('location', value)}
            />
            <Field
              label="Website"
              value={resume.personal.website}
              placeholder={sampleResume.personal.website}
              onChange={(value) => updatePersonal('website', value)}
            />
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
              placeholder={sampleResume.personal.summary}
              rows={7}
              className="profile-summary-field"
              action={
                <AiFieldButton
                  label="Generate professional summary"
                  onClick={() =>
                    openAiAssistant({
                      type: 'professional-summary',
                      label: 'Professional summary',
                      currentValue: resume.personal.summary,
                      context: resumeContext,
                      onApply: (text) => updatePersonal('summary', text),
                    })
                  }
                />
              }
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
            placeholder={`e.g. ${sampleResume.skills.slice(0, 3).join(', ')}`}
            onChange={(tags) => updateTags('skills', tags)}
          />
          <TagEditor
            title="Languages"
            eyebrow="Communication"
            tags={resume.languages}
            placeholder={`e.g. ${sampleResume.languages.join(', ')}`}
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
          onGenerateText={openAiAssistant}
          resumeContext={resumeContext}
          sampleItems={sampleResume.experience}
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
          onGenerateText={openAiAssistant}
          resumeContext={resumeContext}
          sampleItems={sampleResume.education}
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
            onGenerateText={openAiAssistant}
            resumeContext={resumeContext}
            sampleItems={sampleResume.projects}
          />
          <SectionEditor
            {...sectionConfigs.certifications}
            items={resume.certifications}
            onChange={updateItem}
            onAdd={addItem}
            onRemove={removeItem}
            sampleItems={sampleResume.certifications}
          />
        </>
      );
    case 'style':
      return (
        <>
          <section className="style-responsive-preview" aria-label="Live style preview">
            <div className="preview-toolbar compact">
              <div>
                <p className="eyebrow">Live style preview</p>
                <h2>{activeTemplate.name}</h2>
              </div>
              <span className="template-pill">{style.density}</span>
            </div>
            <div className="preview-stage style-preview-stage resume-export-scope print-preview-scope">
              <ResumePreview
                resume={previewResume}
                style={style}
                template={activeTemplate}
              />
            </div>
          </section>
          <StyleControls style={style} onChange={updateStyle} />
        </>
      );
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
          <div className="preview-stage wizard-preview-stage resume-export-scope print-preview-scope">
            <ResumePreview
              ref={previewRef}
              resume={previewResume}
              style={style}
              template={activeTemplate}
            />
          </div>
        </section>
      );
    default:
      return null;
  }
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

function AiAssistantDialog({ assistant, onChange, onClose, onGenerate, onApply }) {
  const generatedText = String(assistant.result ?? '');
  const hasResult = generatedText.trim().length > 0;
  const progressPercent = typeof assistant.progress === 'number' ? Math.round(assistant.progress * 100) : null;

  return (
    <div className="ai-backdrop" role="presentation" onClick={onClose}>
      <section
        className="ai-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ai-dialog-header">
          <span className="ai-dialog-icon" aria-hidden="true">
            <Sparkles size={22} />
          </span>
          <div>
            <p className="eyebrow">{getSmartGeneratorName()}</p>
            <h2 id="ai-dialog-title">{assistant.config?.label ?? 'Generate resume text'}</h2>
          </div>
        </div>

        {assistant.statusText ? (
          <div className="ai-status" aria-live="polite">
            <div>
              <span>{assistant.statusText}</span>
              {progressPercent == null ? null : <strong>{progressPercent}%</strong>}
            </div>
            {progressPercent == null ? null : (
              <div className="ai-status-bar" aria-hidden="true">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            )}
          </div>
        ) : null}

        <div className="ai-control-grid">
          <div className="ai-control">
            <span>Tone</span>
            <div className="ai-segmented">
              {['professional', 'confident', 'friendly'].map((tone) => (
                <button
                  className={assistant.tone === tone ? 'active' : ''}
                  type="button"
                  key={tone}
                  onClick={() => onChange((current) => ({ ...current, tone }))}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-control">
            <span>Length</span>
            <div className="ai-segmented">
              {['short', 'medium', 'detailed'].map((length) => (
                <button
                  className={assistant.length === length ? 'active' : ''}
                  type="button"
                  key={length}
                  onClick={() => onChange((current) => ({ ...current, length }))}
                >
                  {length}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="ai-notes">
          <span>Notes for suggestion</span>
          <textarea
            value={assistant.prompt}
            placeholder="Example: focus on React, leadership, and measurable impact."
            rows={3}
            onChange={(event) => onChange((current) => ({ ...current, prompt: event.target.value }))}
          />
        </label>

        {assistant.error ? <p className="ai-error">{assistant.error}</p> : null}

        {hasResult ? (
          <label className="ai-result">
            <span>Generated text</span>
            <textarea
              value={generatedText}
              rows={assistant.config?.type?.includes('highlights') ? 5 : 4}
              onChange={(event) => onChange((current) => ({ ...current, result: event.target.value }))}
            />
          </label>
        ) : null}

        <div className="ai-actions">
          <button className="confirm-button subtle" type="button" onClick={onClose} disabled={assistant.isLoading}>
            Cancel
          </button>
          <button className="confirm-button subtle" type="button" onClick={onGenerate} disabled={assistant.isLoading}>
            {assistant.isLoading ? 'Generating...' : hasResult ? 'Regenerate' : 'Generate'}
          </button>
          <button className="confirm-button primary" type="button" onClick={onApply} disabled={!hasResult || assistant.isLoading}>
            Insert
          </button>
        </div>
      </section>
    </div>
  );
}

function PhotoUploader({ personal, onPhotoUpload, onRemovePhoto, photoState }) {
  return (
    <div className="photo-uploader">
      <label className={`photo-uploader-target ${photoState.isProcessing ? 'processing' : ''}`}>
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
          <strong>
            {photoState.isProcessing
              ? 'Optimizing photo…'
              : personal.photo
                ? 'Change photo'
                : 'Upload photo'}
          </strong>
          <small>JPG, PNG, or WebP. Large images are optimized automatically.</small>
        </span>
        <ImagePlus size={20} aria-hidden="true" />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={photoState.isProcessing}
          onChange={(event) => {
            onPhotoUpload(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>
      {photoState.error ? (
        <p className="photo-error" role="alert">{photoState.error}</p>
      ) : null}
      {personal.photo ? (
        <button
          className="photo-remove-button"
          type="button"
          onClick={onRemovePhoto}
          disabled={photoState.isProcessing}
        >
          <Trash2 size={16} aria-hidden="true" />
          <span>Remove</span>
        </button>
      ) : null}
    </div>
  );
}

function getCompletedSteps(resume, style, interactedStyleFields, isPreviewComplete) {
  const startedProjects = getStartedItems(resume.projects, ['name', 'role', 'start', 'end', 'summary', 'highlights']);
  const startedCertifications = getStartedItems(resume.certifications, ['title', 'issuer', 'year']);
  const hasStartedExtra = startedProjects.length > 0 || startedCertifications.length > 0;

  return {
    template: Boolean(interactedStyleFields.templateId) && hasText(style.templateId),
    identity: hasAllText([resume.personal.fullName, resume.personal.headline]),
    contact: hasAllText([resume.personal.email, resume.personal.phone, resume.personal.location]),
    summary: hasText(resume.personal.summary),
    skills: hasListValue(resume.skills) && hasListValue(resume.languages),
    experience: isSectionComplete(
      resume.experience,
      ['role', 'company', 'location', 'start', 'end', 'summary', 'highlights'],
      ['role', 'company', 'start', 'end', 'summary'],
    ),
    education: isSectionComplete(
      resume.education,
      ['degree', 'school', 'location', 'start', 'end', 'summary'],
      ['degree', 'school', 'start', 'end'],
    ),
    extras:
      hasStartedExtra &&
      startedProjects.every((item) => hasAllItemValues(item, ['name', 'role', 'summary'])) &&
      startedCertifications.every((item) => hasAllItemValues(item, ['title', 'issuer', 'year'])),
    style:
      ['accentColor', 'fontPairing', 'density'].every((field) => interactedStyleFields[field]) &&
      hasStyleChanges(style) &&
      hasAllText([style.accentColor, style.fontPairing, style.density]),
    preview: isPreviewComplete,
  };
}

function getStartedSteps(resume, style, interactedStyleFields, isPreviewComplete) {
  return {
    template: Boolean(interactedStyleFields.templateId),
    identity: hasAllOrSomeText([
      resume.personal.fullName,
      resume.personal.headline,
      resume.personal.photo,
    ]),
    contact: hasAllOrSomeText([
      resume.personal.email,
      resume.personal.phone,
      resume.personal.location,
      resume.personal.website,
    ]),
    summary: hasText(resume.personal.summary),
    skills: hasListValue(resume.skills) || hasListValue(resume.languages),
    experience:
      getStartedItems(
        resume.experience,
        ['role', 'company', 'location', 'start', 'end', 'summary', 'highlights'],
      ).length > 0,
    education:
      getStartedItems(
        resume.education,
        ['degree', 'school', 'location', 'start', 'end', 'summary'],
      ).length > 0,
    extras:
      getStartedItems(
        resume.projects,
        ['name', 'role', 'start', 'end', 'summary', 'highlights'],
      ).length > 0 ||
      getStartedItems(resume.certifications, ['title', 'issuer', 'year']).length > 0,
    style:
      ['accentColor', 'fontPairing', 'density'].some((field) => interactedStyleFields[field]) &&
      hasStyleChanges(style),
    preview: isPreviewComplete,
  };
}

function hasStyleChanges(style) {
  return ['accentColor', 'fontPairing', 'density'].some(
    (field) => style[field] !== defaultStyle[field],
  );
}

function isSectionComplete(items, allKeys, requiredKeys) {
  const startedItems = getStartedItems(items, allKeys);
  return startedItems.length > 0 && startedItems.every((item) => hasAllItemValues(item, requiredKeys));
}

function getStartedItems(items, keys) {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => keys.some((key) => hasListValue(item[key]) || hasText(item[key])));
}

function hasAllItemValues(item, keys) {
  return keys.every((key) => hasListValue(item[key]) || hasText(item[key]));
}

function hasAllText(values) {
  return values.every(hasText);
}

function hasAllOrSomeText(values) {
  return values.some(hasText);
}

function hasListValue(value) {
  return Array.isArray(value) && value.some(hasText);
}

function hasText(value) {
  return String(value ?? '').trim().length > 0;
}

function getResumeContext(resume) {
  return {
    personal: {
      fullName: resume.personal.fullName,
      headline: resume.personal.headline,
      location: resume.personal.location,
      summary: resume.personal.summary,
    },
    skills: resume.skills,
    languages: resume.languages,
    experience: resume.experience.slice(0, 4),
    education: resume.education.slice(0, 3),
    projects: resume.projects.slice(0, 3),
    certifications: resume.certifications.slice(0, 4),
  };
}

export default App;
