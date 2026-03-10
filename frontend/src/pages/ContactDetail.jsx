import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Briefcase, MapPin, Star, Edit2, Trash2, Tag, Globe, Github, Twitter, Linkedin } from 'lucide-react';
import { contactAPI } from '../services/api';
import Sidebar from '../components/Layout/Sidebar';
import toast from 'react-hot-toast';

const categoryBg = {
  personal: 'from-cyan-500 to-blue-600',
  work: 'from-violet-500 to-purple-600',
  family: 'from-emerald-500 to-teal-600',
  other: 'from-amber-500 to-orange-600',
};

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    contactAPI.getOne(id)
      .then((res) => { setContact(res.data.contact); setIsFav(res.data.contact.isFavorite); })
      .catch(() => { toast.error('Contact not found'); navigate('/contacts'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleFavorite = async () => {
    try {
      await contactAPI.toggleFavorite(id);
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favorites' : 'Added to favorites ⭐');
    } catch { toast.error('Failed to update'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this contact?')) return;
    try {
      await contactAPI.delete(id);
      toast.success('Contact deleted');
      navigate('/contacts');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return (
    <div className="flex h-screen bg-void">
      <Sidebar />
      <main className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
      </main>
    </div>
  );

  if (!contact) return null;
  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-text-muted hover:text-text-secondary text-sm transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Contacts
            </button>
          </motion.div>

          {/* Hero card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl overflow-hidden mb-6">
            <div className={`h-28 bg-gradient-to-r ${categoryBg[contact.category] || categoryBg.other} opacity-30`} />
            <div className="px-8 pb-8 -mt-12">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div className="flex items-end gap-5">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${categoryBg[contact.category] || categoryBg.other} flex items-center justify-center text-white font-display font-bold text-2xl shadow-2xl border-4 border-void shrink-0`}>
                    {initials || '?'}
                  </div>
                  <div className="pb-1">
                    <h1 className="font-display font-bold text-3xl text-text-primary">
                      {contact.firstName} {contact.lastName}
                    </h1>
                    {contact.jobTitle && <p className="text-text-secondary">{contact.jobTitle}</p>}
                    {contact.company && (
                      <p className="text-text-muted text-sm flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3.5 h-3.5" /> {contact.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pb-1">
                  <motion.button whileTap={{ scale: 0.9 }} onClick={handleFavorite}
                    className={`p-3 rounded-xl border transition-all ${isFav ? 'bg-amber-400/15 border-amber-400/40 text-amber-400' : 'border-border text-text-muted hover:border-amber-400/40 hover:text-amber-400'}`}>
                    <Star className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
                  </motion.button>
                  <Link to={`/contacts/${id}/edit`} className="p-3 rounded-xl border border-border text-text-muted hover:border-cyan-400/40 hover:text-cyan-400 transition-all">
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button onClick={handleDelete} className="p-3 rounded-xl border border-border text-text-muted hover:border-rose-400/40 hover:text-rose-400 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Info grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contact info */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-text-primary mb-4">Contact Information</h3>
              <div className="space-y-3">
                {contact.email && <InfoRow icon={Mail} label="Email" value={contact.email} href={`mailto:${contact.email}`} />}
                {contact.phone && <InfoRow icon={Phone} label="Phone" value={contact.phone} href={`tel:${contact.phone}`} />}
                <InfoRow icon={Tag} label="Category" value={<span className="capitalize">{contact.category}</span>} />
              </div>
            </motion.div>

            {/* Address */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-6">
              <h3 className="font-display font-semibold text-text-primary mb-4">Address</h3>
              {Object.values(contact.address || {}).some(Boolean) ? (
                <div className="flex items-start gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 mt-0.5 text-text-muted shrink-0" />
                  <div className="text-sm">
                    {contact.address.street && <p>{contact.address.street}</p>}
                    {(contact.address.city || contact.address.state) && (
                      <p>{[contact.address.city, contact.address.state].filter(Boolean).join(', ')}</p>
                    )}
                    {contact.address.country && <p>{contact.address.country}</p>}
                    {contact.address.zipCode && <p className="text-text-muted">{contact.address.zipCode}</p>}
                  </div>
                </div>
              ) : <p className="text-text-muted text-sm">No address provided</p>}
            </motion.div>

            {/* Social media */}
            {Object.values(contact.socialMedia || {}).some(Boolean) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold text-text-primary mb-4">Social Media</h3>
                <div className="flex gap-3 flex-wrap">
                  {contact.socialMedia.linkedin && <SocialBtn icon={Linkedin} href={contact.socialMedia.linkedin} label="LinkedIn" color="text-blue-400" />}
                  {contact.socialMedia.twitter && <SocialBtn icon={Twitter} href={contact.socialMedia.twitter} label="Twitter" color="text-sky-400" />}
                  {contact.socialMedia.github && <SocialBtn icon={Github} href={contact.socialMedia.github} label="GitHub" color="text-text-secondary" />}
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {contact.notes && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="glass rounded-2xl p-6">
                <h3 className="font-display font-semibold text-text-primary mb-4">Notes</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{contact.notes}</p>
              </motion.div>
            )}
          </div>

          {/* Tags */}
          {contact.tags?.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5 mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-text-muted text-sm mr-2">Tags:</span>
              {contact.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-text-muted" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        {href ? (
          <a href={href} className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors truncate block">{value}</a>
        ) : (
          <p className="text-sm text-text-secondary">{value}</p>
        )}
      </div>
    </div>
  );
}

function SocialBtn({ icon: Icon, href, label, color }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-current transition-all text-sm font-medium ${color}`}>
      <Icon className="w-4 h-4" /> {label}
    </a>
  );
}
