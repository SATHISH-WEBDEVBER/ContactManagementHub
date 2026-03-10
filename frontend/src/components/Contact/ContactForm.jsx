import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, User, Mail, Phone, Briefcase, MapPin, Tag, Globe } from 'lucide-react';

const CATEGORIES = ['personal', 'work', 'family', 'other'];

export default function ContactForm({ initial = {}, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    company: '', jobTitle: '', category: 'personal',
    notes: '', tags: '',
    address: { street: '', city: '', state: '', country: '', zipCode: '' },
    socialMedia: { linkedin: '', twitter: '', github: '' },
    ...initial,
  });

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const setAddress = (f, v) => setForm((p) => ({ ...p, address: { ...p.address, [f]: v } }));
  const setSocial = (f, v) => setForm((p) => ({ ...p, socialMedia: { ...p.socialMedia, [f]: v } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form, tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <Section title="Basic Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name *">
            <input className="input-field" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Jane" required />
          </Field>
          <Field label="Last Name">
            <input className="input-field" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Doe" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input className="input-field pl-10" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@example.com" />
            </div>
          </Field>
          <Field label="Phone">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input className="input-field pl-10" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 555 0100" />
            </div>
          </Field>
        </div>

        <Field label="Category">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button key={cat} type="button"
                onClick={() => set('category', cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize border transition-all duration-200 
                  ${form.category === cat
                    ? 'bg-cyan-400/15 border-cyan-400/50 text-cyan-400'
                    : 'border-border text-text-muted hover:border-muted hover:text-text-secondary'}`}>
                {cat}
              </button>
            ))}
          </div>
        </Field>
      </Section>

      {/* Work Info */}
      <Section title="Work Information" icon={Briefcase}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Company">
            <input className="input-field" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Corp" />
          </Field>
          <Field label="Job Title">
            <input className="input-field" value={form.jobTitle} onChange={(e) => set('jobTitle', e.target.value)} placeholder="Software Engineer" />
          </Field>
        </div>
      </Section>

      {/* Address */}
      <Section title="Address" icon={MapPin}>
        <Field label="Street">
          <input className="input-field" value={form.address.street} onChange={(e) => setAddress('street', e.target.value)} placeholder="123 Main St" />
        </Field>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="City">
            <input className="input-field" value={form.address.city} onChange={(e) => setAddress('city', e.target.value)} placeholder="New York" />
          </Field>
          <Field label="State">
            <input className="input-field" value={form.address.state} onChange={(e) => setAddress('state', e.target.value)} placeholder="NY" />
          </Field>
          <Field label="Country">
            <input className="input-field" value={form.address.country} onChange={(e) => setAddress('country', e.target.value)} placeholder="USA" />
          </Field>
        </div>
      </Section>

      {/* Social Media */}
      <Section title="Social Media" icon={Globe}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['linkedin', 'twitter', 'github'].map((platform) => (
            <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
              <input className="input-field" value={form.socialMedia[platform]}
                onChange={(e) => setSocial(platform, e.target.value)} placeholder={`https://${platform}.com/...`} />
            </Field>
          ))}
        </div>
      </Section>

      {/* Tags & Notes */}
      <Section title="Tags & Notes" icon={Tag}>
        <Field label="Tags (comma separated)">
          <input className="input-field" value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="friend, vip, client" />
        </Field>
        <Field label="Notes">
          <textarea className="input-field resize-none h-24" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any additional notes..." maxLength={500} />
          <p className="text-xs text-text-muted text-right mt-1">{form.notes.length}/500</p>
        </Field>
      </Section>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save Contact
        </motion.button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost flex items-center gap-2">
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-lg bg-cyan-400/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>
        <h3 className="font-display font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}
