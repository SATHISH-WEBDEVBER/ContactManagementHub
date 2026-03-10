import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Star, Briefcase, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../../services/api';
import toast from 'react-hot-toast';

const categoryColors = {
  personal: 'badge-personal',
  work: 'badge-work',
  family: 'badge-family',
  other: 'badge-other',
};

const categoryBg = {
  personal: 'from-cyan-500 to-blue-600',
  work: 'from-violet-500 to-purple-600',
  family: 'from-emerald-500 to-teal-600',
  other: 'from-amber-500 to-orange-600',
};

export default function ContactCard({ contact, onDelete, onUpdate }) {
  const [isFav, setIsFav] = useState(contact.isFavorite);
  const [showMenu, setShowMenu] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await contactAPI.toggleFavorite(contact._id);
      setIsFav(!isFav);
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete ${contact.firstName}?`)) return;
    try {
      await contactAPI.delete(contact._id);
      onDelete?.(contact._id);
      toast.success('Contact deleted');
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const initials = `${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Link to={`/contacts/${contact._id}`} className="block">
      <div className="contact-card relative">
        {/* Category indicator */}
        <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b ${categoryBg[contact.category] || categoryBg.other}`} />

        <div className="pl-2">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${categoryBg[contact.category] || categoryBg.other} flex items-center justify-center text-white font-display font-bold text-sm shrink-0 shadow-lg`}>
                {initials || '?'}
              </div>
              <div className="min-w-0">
                <p className="font-display font-semibold text-text-primary truncate leading-tight">
                  {contact.firstName} {contact.lastName}
                </p>
                {contact.company && (
                  <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3 h-3" /> {contact.company}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleFavorite}
                className={`p-1.5 rounded-lg transition-colors ${isFav ? 'text-amber-400' : 'text-text-muted hover:text-amber-400'}`}
              >
                <Star className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
              </motion.button>

              <div className="relative">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowMenu(!showMenu); }}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-secondary transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-7 z-20 glass-strong border border-border rounded-xl py-1.5 w-36 shadow-xl"
                    onMouseLeave={() => setShowMenu(false)}
                  >
                    <Link to={`/contacts/${contact._id}/edit`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                      onClick={(e) => e.stopPropagation()}>
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </Link>
                    <button onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Contact details */}
          <div className="space-y-1.5 mt-3">
            {contact.email && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{contact.phone}</span>
              </div>
            )}
          </div>

          {/* Category tag */}
          <div className="mt-3 flex items-center justify-between">
            <span className={`tag border ${categoryColors[contact.category] || ''}`}>
              {contact.category}
            </span>
            {contact.tags?.length > 0 && (
              <span className="text-xs text-text-muted font-mono">+{contact.tags.length} tags</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
