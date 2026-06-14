import { sampleResume } from '../data/sampleResume.js';

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

export function normalizeImportedResume(imported) {
  if (!imported || typeof imported !== 'object') {
    return sampleResume;
  }

  return {
    ...sampleResume,
    ...imported,
    personal: {
      ...sampleResume.personal,
      ...(imported.personal ?? {}),
    },
    skills: Array.isArray(imported.skills) ? imported.skills : sampleResume.skills,
    languages: Array.isArray(imported.languages) ? imported.languages : sampleResume.languages,
    experience: withStableIds(imported.experience, sampleResume.experience),
    education: withStableIds(imported.education, sampleResume.education),
    projects: withStableIds(imported.projects, sampleResume.projects),
    certifications: withStableIds(imported.certifications, sampleResume.certifications),
  };
}

function withStableIds(value, fallback) {
  if (!Array.isArray(value)) return fallback;

  return value.map((item) => ({
    ...item,
    id: item.id || crypto.randomUUID(),
  }));
}
