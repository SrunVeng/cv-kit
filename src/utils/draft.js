const draftStorageKey = 'khmer-cv-session-draft-v1';

export function loadResumeDraft() {
  try {
    const savedValue = window.sessionStorage.getItem(draftStorageKey);
    if (!savedValue) return null;

    const draft = JSON.parse(savedValue);
    if (!isValidDraft(draft)) return null;

    return {
      resume: draft.resume,
      style: draft.style,
      interactedStyleFields: draft.interactedStyleFields ?? {},
      isPreviewComplete: Boolean(draft.isPreviewComplete),
      currentStep: clampStep(draft.currentStep),
    };
  } catch {
    return null;
  }
}

export function saveResumeDraft(draft) {
  try {
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(draft));
  } catch {
    try {
      window.sessionStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          ...draft,
          resume: {
            ...draft.resume,
            personal: {
              ...draft.resume.personal,
              photo: '',
            },
          },
        }),
      );
    } catch {
      // The app remains usable when storage is unavailable or full.
    }
  }
}

export function clearResumeDraft() {
  try {
    window.sessionStorage.removeItem(draftStorageKey);
  } catch {
    // Nothing else is required when storage is unavailable.
  }
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
