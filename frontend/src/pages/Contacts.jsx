import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, SlidersHorizontal, Users, Grid, List as ListIcon } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { contactAPI } from '../services/api';
import ContactCard from '../components/Contact/ContactCard';
import Sidebar from '../components/Layout/Sidebar';
import toast from 'react-hot-toast';

const CATEGORIES = ['', 'personal', 'work', 'family', 'other'];

export default function Contacts() {
  const [searchParams] = useSearchParams();
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isFavorite, setIsFavorite] = useState(searchParams.get('isFavorite') === 'true');
  const [page, setPage] = useState(1);
  const [view, setView] = useState('grid');

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await contactAPI.getAll({
        search: search || undefined,
        category: category || undefined,
        isFavorite: isFavorite || undefined,
        page,
        limit: 12,
      });
      setContacts(res.data.contacts);
      setPagination(res.data.pagination);
    } catch {
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [search, category, isFavorite, page]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = (id) => setContacts((c) => c.filter((x) => x._id !== id));

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display font-bold text-3xl text-text-primary">Contacts</h1>
                <p className="text-text-secondary mt-1 text-sm">
                  {pagination.total} contact{pagination.total !== 1 ? 's' : ''} in your network
                </p>
              </div>
              <Link to="/contacts/new" className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Contact
              </Link>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input className="input-field pl-10 py-2.5 text-sm" placeholder="Search contacts..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                  className={`px-3 py-2 rounded-xl text-xs font-medium capitalize border transition-all
                    ${category === cat ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-400' : 'border-border text-text-muted hover:border-muted'}`}>
                  {cat || 'All'}
                </button>
              ))}
            </div>

            {/* Favorite toggle */}
            <button onClick={() => { setIsFavorite(!isFavorite); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs border transition-all
                ${isFavorite ? 'bg-amber-400/15 border-amber-400/40 text-amber-400' : 'border-border text-text-muted hover:border-muted'}`}>
              ★ Favorites
            </button>

            {/* View toggle */}
            <div className="flex border border-border rounded-xl overflow-hidden">
              {[['grid', Grid], ['list', ListIcon]].map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className={`p-2 transition-colors ${view === v ? 'bg-surface text-cyan-400' : 'text-text-muted hover:text-text-secondary'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Contact grid / list */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-5 h-36 animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
                ))}
              </motion.div>
            ) : contacts.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-3xl p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="font-display font-semibold text-xl text-text-primary mb-2">
                  {search || category || isFavorite ? 'No matches found' : 'No contacts yet'}
                </h3>
                <p className="text-text-secondary text-sm mb-6">
                  {search ? 'Try a different search term' : 'Add your first contact to get started'}
                </p>
                {!search && <Link to="/contacts/new" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Contact</Link>}
              </motion.div>
            ) : (
              <motion.div key="contacts"
                className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {contacts.map((contact, i) => (
                  <motion.div key={contact._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}>
                    <ContactCard contact={contact} onDelete={handleDelete} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {[...Array(pagination.pages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium border transition-all
                    ${page === i + 1 ? 'bg-cyan-400/15 border-cyan-400/40 text-cyan-400' : 'border-border text-text-muted hover:border-muted'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
