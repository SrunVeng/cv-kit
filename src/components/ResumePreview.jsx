import { forwardRef, memo } from 'react';
import { Globe2, Mail, MapPin, Phone } from 'lucide-react';

const monthYearFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
});

const ResumePreview = memo(forwardRef(function ResumePreview({ resume, style, template }, ref) {
  const { personal } = resume;
  const className = [
    'resume-page',
    template.className,
    `font-${style.fontPairing}`,
    `density-${style.density}`,
  ].join(' ');

  return (
    <article ref={ref} className={className} style={{ '--accent': style.accentColor }}>
      <header className="cv-hero">
        <div className="cv-photo-wrap">
          {personal.photo ? <img src={personal.photo} alt="" /> : <span>{initials(personal.fullName)}</span>}
        </div>
        <div className="cv-title-block">
          <p className="cv-kicker">
            <PreviewText value={personal.location} fallback="Open to opportunities" />
          </p>
          <h1>
            <PreviewText value={personal.fullName} fallback="Your Name" />
          </h1>
          <h2>
            <PreviewText value={personal.headline} fallback="Professional headline" />
          </h2>
        </div>
      </header>

      <div className="cv-body">
        <aside className="cv-sidebar">
          <PreviewSection title="Contact" show={hasAnyPersonalContact(personal)}>
            <ContactItem icon={Mail} label="Email" value={personal.email} />
            <ContactItem icon={Phone} label="Phone" value={personal.phone} />
            <ContactItem icon={MapPin} label="Location" value={personal.location} />
            <ContactItem icon={Globe2} label="Website" value={personal.website} />
          </PreviewSection>

          <PreviewSection title="Skills" show={hasItems(resume.skills)}>
            <TagCloud tags={resume.skills} />
          </PreviewSection>

          <PreviewSection title="Education" show={resume.education.length > 0}>
            {resume.education.map((item) => (
              <CompactItem
                key={item.id}
                item={item}
                labels={{
                  title: 'Degree',
                  subtitle: 'School',
                }}
                metaFields={['location', 'start', 'end']}
              />
            ))}
          </PreviewSection>

          <PreviewSection title="Languages" show={hasItems(resume.languages)}>
            <TagCloud tags={resume.languages} subtle />
          </PreviewSection>

          <PreviewSection title="Certifications" show={resume.certifications.length > 0}>
            {resume.certifications.map((item) => (
              <CompactItem
                key={item.id}
                item={item}
                labels={{
                  title: 'Certification',
                  subtitle: 'Issuer',
                }}
                titleKey="title"
                subtitleKey="issuer"
                metaFields={['year']}
              />
            ))}
          </PreviewSection>
        </aside>

        <main className="cv-main">
          <PreviewSection title="Profile" show={hasText(personal.summary)}>
            <p className="cv-summary">{personal.summary}</p>
          </PreviewSection>

          <PreviewSection title="Experience" show={resume.experience.length > 0}>
            {resume.experience.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                titleKey="role"
                subtitleKey="company"
                labels={{
                  title: 'Role',
                  subtitle: 'Company',
                }}
              />
            ))}
          </PreviewSection>

          <PreviewSection title="Projects" show={resume.projects.length > 0}>
            {resume.projects.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                titleKey="name"
                subtitleKey="role"
                labels={{
                  title: 'Project name',
                  subtitle: 'Role',
                }}
              />
            ))}
          </PreviewSection>
        </main>
      </div>
    </article>
  );
}));

function PreviewSection({ title, children, show = true }) {
  if (!show) return null;

  return (
    <section className="cv-section">
      <div className="cv-section-heading">
        <h3>{title}</h3>
      </div>
      <div className="cv-section-content">{children}</div>
    </section>
  );
}

function ContactItem({ icon: Icon, label, value }) {
  if (!hasText(value)) return null;

  return (
    <p className="contact-item">
      <Icon size={14} aria-hidden="true" />
      <span>{value}</span>
      <span className="sr-only">{label}</span>
    </p>
  );
}

function TagCloud({ tags, subtle = false }) {
  const cleanTags = tags.filter(hasText);
  if (!cleanTags.length) return null;

  return (
    <div className={`cv-tags ${subtle ? 'subtle' : ''}`}>
      {cleanTags.map((tag, index) => (
        <span key={`${tag}-${index}`}>{tag}</span>
      ))}
    </div>
  );
}

function CompactItem({
  item,
  labels,
  titleKey = 'degree',
  subtitleKey = 'school',
  metaFields,
}) {
  const meta = metaFields.map((field) => item[field]).filter(hasText);

  return (
    <div className="compact-item">
      <strong>
        <PreviewText value={item[titleKey]} fallback={labels.title} />
      </strong>
      {hasText(item[subtitleKey]) ? <span>{item[subtitleKey]}</span> : null}
      {meta.length ? <MetaRow items={meta} small /> : null}
      {hasText(item.summary) ? <p>{item.summary}</p> : null}
    </div>
  );
}

function TimelineItem({ item, titleKey, subtitleKey, labels }) {
  const meta = [item.location, item.start, item.end].filter(hasText);
  const highlights = Array.isArray(item.highlights) ? item.highlights.filter(hasText) : [];

  return (
    <article className="timeline-item">
      <div className="timeline-dot" aria-hidden="true" />
      <div className="item-title-row">
        <div>
          <h4>
            <PreviewText value={item[titleKey]} fallback={labels.title} />
          </h4>
          {hasText(item[subtitleKey]) ? <p>{item[subtitleKey]}</p> : null}
        </div>
        {meta.length ? <MetaRow items={meta} /> : null}
      </div>
      {hasText(item.summary) ? <p className="item-body">{item.summary}</p> : null}
      {highlights.length ? (
        <ul>
          {highlights.map((highlight, index) => (
            <li key={`highlight-${index}`}>{highlight}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function MetaRow({ items, small = false }) {
  const Tag = small ? 'small' : 'span';

  return (
    <Tag className="inline-meta-row">
      {items.map((item, index) => (
        <span key={`${item}-${index}`}>{formatMetaValue(item)}</span>
      ))}
    </Tag>
  );
}

function PreviewText({ value, fallback }) {
  const isPlaceholder = !hasText(value);

  return <span className={isPlaceholder ? 'cv-placeholder' : undefined}>{isPlaceholder ? fallback : value}</span>;
}

function hasItems(items) {
  return Array.isArray(items) && items.some(hasText);
}

function hasAnyPersonalContact(personal) {
  return [personal.email, personal.phone, personal.location, personal.website].some(hasText);
}

function hasText(value) {
  return String(value ?? '').trim().length > 0;
}

function formatMetaValue(value) {
  const text = String(value ?? '').trim();
  const monthMatch = text.match(/^(\d{4})-(\d{2})$/);
  if (!monthMatch) return text;

  const date = new Date(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1);
  return monthYearFormatter.format(date);
}

function initials(name) {
  return (
    name
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'CV'
  );
}

export default ResumePreview;
