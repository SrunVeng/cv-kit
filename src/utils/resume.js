const factories = {
  experience: () => ({
    id: crypto.randomUUID(),
    role: 'New role',
    company: 'Company',
    location: '',
    start: '',
    end: '',
    summary: '',
    highlights: [''],
  }),
  education: () => ({
    id: crypto.randomUUID(),
    degree: 'Degree or program',
    school: 'School',
    location: '',
    start: '',
    end: '',
    summary: '',
  }),
  projects: () => ({
    id: crypto.randomUUID(),
    name: 'Project name',
    role: '',
    start: '',
    end: '',
    summary: '',
    highlights: [''],
  }),
  certifications: () => ({
    id: crypto.randomUUID(),
    title: 'Certification',
    issuer: '',
    year: '',
  }),
};

export function createEntry(section) {
  return factories[section] ? factories[section]() : { id: crypto.randomUUID() };
}
