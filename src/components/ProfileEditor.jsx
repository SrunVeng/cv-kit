import { ImagePlus, UserRound } from 'lucide-react';
import { Field, TextareaField } from './FormFields.jsx';

function ProfileEditor({ personal, onChange, onPhotoUpload }) {
  return (
    <section className="editor-section" aria-labelledby="profile-heading">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Identity</p>
          <h2 id="profile-heading">Profile</h2>
        </div>
      </div>

      <label className="photo-uploader">
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
          <strong>Upload photo</strong>
          <small>PNG, JPG, or WEBP</small>
        </span>
        <ImagePlus size={20} aria-hidden="true" />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            onPhotoUpload(event.target.files?.[0]);
            event.target.value = '';
          }}
        />
      </label>

      <div className="field-grid">
        <Field label="Full name" value={personal.fullName} onChange={(value) => onChange('fullName', value)} />
        <Field label="Headline" value={personal.headline} onChange={(value) => onChange('headline', value)} />
        <Field label="Email" value={personal.email} onChange={(value) => onChange('email', value)} />
        <Field label="Phone" value={personal.phone} onChange={(value) => onChange('phone', value)} />
        <Field label="Location" value={personal.location} onChange={(value) => onChange('location', value)} />
        <Field label="Website" value={personal.website} onChange={(value) => onChange('website', value)} />
        <TextareaField
          label="Professional summary"
          value={personal.summary}
          onChange={(value) => onChange('summary', value)}
          rows={5}
          className="profile-summary-field"
        />
      </div>
    </section>
  );
}

export default ProfileEditor;
