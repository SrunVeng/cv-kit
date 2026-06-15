const actionVerbs = ['Led', 'Built', 'Improved', 'Created', 'Supported', 'Delivered'];

export function getSmartGeneratorName() {
  return 'Smart Suggestions';
}

export async function generateResumeText(payload, options = {}) {
  options.onProgress?.({ text: 'Creating a smart draft from your CV fields...', progress: 1 });

  const context = payload.context ?? {};
  const resume = context.resume ?? context;
  const item = context.item ?? {};
  const type = payload.type ?? '';
  const notes = clean(payload.prompt);
  const currentValue = clean(payload.currentValue);

  if (type === 'professional-summary') {
    return buildProfessionalSummary(resume, payload, notes, currentValue);
  }

  if (type === 'experience-summary') {
    return buildExperienceSummary(item, resume, notes, currentValue);
  }

  if (type === 'experience-highlights') {
    return buildHighlights(item, resume, notes, 'work');
  }

  if (type === 'education-summary') {
    return buildEducationSummary(item, resume, notes, currentValue);
  }

  if (type === 'projects-summary') {
    return buildProjectSummary(item, resume, notes, currentValue);
  }

  if (type === 'projects-highlights') {
    return buildHighlights(item, resume, notes, 'project');
  }

  return notes || currentValue || 'Add a concise, specific sentence that explains your impact and strongest skills.';
}

function buildProfessionalSummary(resume, payload, notes, currentValue) {
  const personal = resume.personal ?? {};
  const headline = clean(personal.headline) || inferHeadline(resume) || 'professional';
  const skills = list(resume.skills).slice(0, 4);
  const experience = list(resume.experience);
  const latestRole = clean(experience[0]?.role);
  const latestCompany = clean(experience[0]?.company);
  const toneLead = payload.tone === 'friendly' ? 'Collaborative' : payload.tone === 'confident' ? 'Results-driven' : 'Detail-oriented';
  const skillText = skills.length ? `with strengths in ${joinReadable(skills)}` : 'with a practical, adaptable skill set';
  const roleText = latestRole ? ` Experienced as ${article(latestRole)} ${latestRole}${latestCompany ? ` at ${latestCompany}` : ''}.` : '';
  const notesText = notes ? ` Focused on ${notes}.` : '';

  if (payload.length === 'short') {
    return `${toneLead} ${headline} ${skillText}.${roleText}`.trim();
  }

  const base = `${toneLead} ${headline} ${skillText}. ${roleText || 'Able to turn goals into clear, reliable work across teams and priorities.'}${notesText}`;
  if (payload.length !== 'detailed') return base.replace(/\s+/g, ' ').trim();

  return `${base} Brings a clear communication style, organized execution, and a focus on measurable value for users and stakeholders.`
    .replace(/\s+/g, ' ')
    .trim();
}

function buildExperienceSummary(item, resume, notes, currentValue) {
  const role = clean(item.role) || 'professional';
  const company = clean(item.company);
  const skills = list(resume.skills).slice(0, 3);
  const skillText = skills.length ? ` using ${joinReadable(skills)}` : '';
  const companyText = company ? ` at ${company}` : '';
  const notesText = notes || currentValue;

  if (notesText) {
    return `${capitalizeSentence(notesText)} while working as ${article(role)} ${role}${companyText}.`;
  }

  return `Contributed as ${article(role)} ${role}${companyText}, supporting clear execution, cross-functional collaboration, and practical improvements${skillText}.`;
}

function buildEducationSummary(item, resume, notes, currentValue) {
  const degree = clean(item.degree) || 'academic program';
  const school = clean(item.school);
  const skills = list(resume.skills).slice(0, 3);
  const focus = notes || currentValue || (skills.length ? joinReadable(skills) : 'core professional skills');

  return `Completed ${degree}${school ? ` at ${school}` : ''}, with focus on ${focus}.`;
}

function buildProjectSummary(item, resume, notes, currentValue) {
  const name = clean(item.name) || 'project';
  const role = clean(item.role);
  const skills = list(resume.skills).slice(0, 3);
  const focus = notes || currentValue || (skills.length ? joinReadable(skills) : 'planning, execution, and delivery');

  return `Worked${role ? ` as ${role}` : ''} on ${name}, focusing on ${focus} and producing practical outcomes for users or stakeholders.`;
}

function buildHighlights(item, resume, notes, mode) {
  const role = clean(item.role) || clean(item.name) || (mode === 'project' ? 'project' : 'role');
  const skills = list(resume.skills).slice(0, 4);
  const noteParts = splitNotes(notes);
  const focusItems = noteParts.length ? noteParts : skills.length ? skills : ['quality', 'collaboration', 'delivery'];

  return focusItems
    .slice(0, 3)
    .map((focus, index) => {
      const verb = actionVerbs[index % actionVerbs.length];
      if (mode === 'project') {
        return `${verb} ${focus} for ${role}, improving clarity, usability, or delivery quality.`;
      }

      return `${verb} ${focus} in ${role}, helping the team improve execution and outcomes.`;
    })
    .join('\n');
}

function inferHeadline(resume) {
  return clean(list(resume.experience)[0]?.role) || clean(list(resume.projects)[0]?.role);
}

function splitNotes(value) {
  return clean(value)
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function list(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function clean(value) {
  return String(value ?? '').trim();
}

function joinReadable(values) {
  const cleanValues = values.map(clean).filter(Boolean);
  if (cleanValues.length <= 1) return cleanValues[0] ?? '';
  if (cleanValues.length === 2) return `${cleanValues[0]} and ${cleanValues[1]}`;
  return `${cleanValues.slice(0, -1).join(', ')}, and ${cleanValues.at(-1)}`;
}

function article(value) {
  return /^[aeiou]/i.test(clean(value)) ? 'an' : 'a';
}

function capitalizeSentence(value) {
  const text = clean(value);
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : text;
}
