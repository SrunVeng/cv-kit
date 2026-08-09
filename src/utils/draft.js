const draftStorageKey = 'khmer-cv-resume-draft-v2';
const legacyDraftStorageKey = 'khmer-cv-session-draft-v1';
const styleStatusVersion = 2;

export function loadResumeDraft() {
  const savedDraft = readDraft('localStorage', draftStorageKey);
  if (savedDraft) return normalizeDraft(savedDraft);

  const legacyDraft =
    readDraft('sessionStorage', legacyDraftStorageKey) ??
    readDraft('localStorage', legacyDraftStorageKey);

  if (!legacyDraft) return null;

  const migrationStatus = saveResumeDraft(legacyDraft);
  if (migrationStatus === 'persistent') {
    removeDraft('sessionStorage', legacyDraftStorageKey);
    removeDraft('localStorage', legacyDraftStorageKey);
  }

  return normalizeDraft(legacyDraft);
}

export function saveResumeDraft(draft) {
  const versionedDraft = {
    ...draft,
    styleStatusVersion,
  };

  if (writeDraft('localStorage', draftStorageKey, versionedDraft)) return 'persistent';

  const lightweightDraft = removeDraftPhotos(versionedDraft);
  if (writeDraft('localStorage', draftStorageKey, lightweightDraft)) return 'persistent';
  if (writeDraft('sessionStorage', draftStorageKey, versionedDraft)) return 'session';
  if (writeDraft('sessionStorage', draftStorageKey, lightweightDraft)) return 'session';

  return 'unavailable';
}

export function clearResumeDraft() {
  removeDraft('localStorage', draftStorageKey);
  removeDraft('sessionStorage', draftStorageKey);
  removeDraft('localStorage', legacyDraftStorageKey);
  removeDraft('sessionStorage', legacyDraftStorageKey);
}

function normalizeDraft(draft) {
  return {
    resume: draft.resume,
    style: draft.style,
    interactedStyleFields: normalizeInteractedStyleFields(draft),
    isPreviewComplete: Boolean(draft.isPreviewComplete),
    currentStep: clampStep(draft.currentStep),
  };
}

function readDraft(storageName, key) {
  try {
    const savedValue = window[storageName].getItem(key);
    if (!savedValue) return null;

    const draft = JSON.parse(savedValue);
    return isValidDraft(draft) ? draft : null;
  } catch {
    return null;
  }
}

function writeDraft(storageName, key, draft) {
  try {
    window[storageName].setItem(key, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

function removeDraft(storageName, key) {
  try {
    window[storageName].removeItem(key);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
}

function removeDraftPhotos(draft) {
  return {
    ...draft,
    resume: {
      ...draft.resume,
      personal: {
        ...draft.resume.personal,
        photo: '',
        photoSource: '',
      },
    },
  };
}

function normalizeInteractedStyleFields(draft) {
  const fields = draft.interactedStyleFields ?? {};
  if (draft.styleStatusVersion === styleStatusVersion) return fields;

  return fields.templateId ? { templateId: true } : {};
}

function isValidDraft(draft) {
  const resume = draft?.resume;
  const style = draft?.style;

  return Boolean(
    resume &&
      typeof resume.personal === 'object' &&
      Array.isArray(resume.skills) &&
      Array.isArray(resume.languages) &&
      Array.isArray(resume.experience) &&
      Array.isArray(resume.education) &&
      Array.isArray(resume.projects) &&
      Array.isArray(resume.certifications) &&
      style &&
      typeof style.templateId === 'string' &&
      typeof style.accentColor === 'string' &&
      typeof style.fontPairing === 'string' &&
      typeof style.density === 'string',
  );
}

function clampStep(value) {
  const step = Number.isInteger(value) ? value : 0;
  return Math.min(9, Math.max(0, step));
}
