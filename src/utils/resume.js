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
    },
    skills: [],
    languages: [],
    experience: [createEntry('experience')],
    education: [createEntry('education')],
    projects: [createEntry('projects')],
    certifications: [createEntry('certifications')],
  };
}
