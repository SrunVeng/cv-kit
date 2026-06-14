import { Award, BriefcaseBusiness, FolderKanban, GraduationCap } from 'lucide-react';
import ProfileEditor from './ProfileEditor.jsx';
import SectionEditor from './SectionEditor.jsx';
import StyleControls from './StyleControls.jsx';
import TagEditor from './TagEditor.jsx';
import TemplatePicker from './TemplatePicker.jsx';

const sectionConfigs = [
  {
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
  {
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
  {
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
  {
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
];

function EditorPanel({
  resume,
  style,
  templates,
  onPersonalChange,
  onPhotoUpload,
  onStyleChange,
  onItemChange,
  onItemAdd,
  onItemRemove,
  onTagsChange,
}) {
  return (
    <aside className="editor-panel" aria-label="Resume editor">
      <ProfileEditor personal={resume.personal} onChange={onPersonalChange} onPhotoUpload={onPhotoUpload} />
      <TemplatePicker templates={templates} activeTemplateId={style.templateId} onChange={onStyleChange} />
      <StyleControls style={style} onChange={onStyleChange} />
      <TagEditor
        title="Skills"
        eyebrow="Capabilities"
        tags={resume.skills}
        onChange={(tags) => onTagsChange('skills', tags)}
      />
      <TagEditor
        title="Languages"
        eyebrow="Communication"
        tags={resume.languages}
        onChange={(tags) => onTagsChange('languages', tags)}
      />
      {sectionConfigs.map((config) => (
        <SectionEditor
          key={config.section}
          {...config}
          items={resume[config.section]}
          onChange={onItemChange}
          onAdd={onItemAdd}
          onRemove={onItemRemove}
        />
      ))}
    </aside>
  );
}

export default EditorPanel;
