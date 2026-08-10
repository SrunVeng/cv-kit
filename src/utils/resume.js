const factories = {
  experience: () => ({
    id: crypto.randomUUID(),
    role: '',
    company: '',
    location: '',
    start: '',
    end: '',
    summary: '',
    highlights: [''],
  }),
  education: () => ({
    id: crypto.randomUUID(),
    degree: '',
    school: '',
    location: '',
    start: '',
    end: '',
    summary: '',
  }),
  projects: () => ({
    id: crypto.randomUUID(),
    name: '',
    role: '',
    start: '',
    end: '',
    summary: '',
    highlights: [''],
  }),
  certifications: () => ({
    id: crypto.randomUUID(),
    title: '',
    issuer: '',
    year: '',
  }),
  customSections: () => ({
    id: crypto.randomUUID(),
    sectionTitle: '',
    title: '',
    subtitle: '',
    details: '',
  }),
};

export function createEntry(section) {
  return factories[section] ? factories[section]() : { id: crypto.randomUUID() };
}

export function createEmptyResume() {
  return {
    personal: {
      fullName: '',
      headline: '',
      email: '',
      phoneCountry: 'US',
      phone: '',
      location: '',
      website: '',
      summary: '',
      photo: '',
      photoSource: '',
      photoSourceWidth: 0,
      photoSourceHeight: 0,
      photoRevision: 0,
      photoPositionX: 50,
      photoPositionY: 40,
      photoZoom: 1,
      photoSmartX: 50,
      photoSmartY: 40,
      photoSmartZoom: 1,
    },
    skills: [],
    languages: [],
    experience: [createEntry('experience')],
    education: [createEntry('education')],
    projects: [createEntry('projects')],
    certifications: [createEntry('certifications')],
    customSections: [],
  };
}
