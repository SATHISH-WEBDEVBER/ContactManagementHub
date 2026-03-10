import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Briefcase, Heart, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ContactCard from '../components/Contact/ContactCard';
import Sidebar from '../components/Layout/Sidebar';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="stat-card"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <TrendingUp className="w-4 h-4 text-text-muted" />
    </div>
    <p className="font-display font-bold text-3xl text-text-primary mb-1">{value}</p>
    <p className="text-text-secondary text-sm font-body">{label}</p>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, favorites: 0, byCategory: [] });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, contactsRes] = await Promise.all([
          contactAPI.getStats(),
          contactAPI.getAll({ limit: 6, sort: '-createdAt' }),
        ]);
        setStats(statsRes.data.stats);
        setRecent(contactsRes.data.contacts);
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getCategoryCount = (cat) =>
    stats.byCategory.find((c) => c._id === cat)?.count || 0;

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="font-display font-bold text-3xl text-text-primary">
                  Good {getGreeting()},{' '}
                  <span className="text-cyan-400">{user?.name?.split(' ')[0]}</span> 👋
                </h1>
                <p className="text-text-secondary mt-1">Here's an overview of your contacts</p>
              </div>
              <Link to="/contacts/new" className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Contact
              </Link>
            </div>
          </motion.div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} label="Total Contacts" value={stats.total} color="bg-cyan-400/10 text-cyan-400" delay={0.05} />
            <StatCard icon={Star} label="Favorites" value={stats.favorites} color="bg-amber-400/10 text-amber-400" delay={0.1} />
            <StatCard icon={Briefcase} label="Work" value={getCategoryCount('work')} color="bg-violet-400/10 text-violet-400" delay={0.15} />
            <StatCard icon={Heart} label="Family" value={getCategoryCount('family')} color="bg-rose-400/10 text-rose-400" delay={0.2} />
          </div>

          {/* Recent contacts */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-xl text-text-primary">Recent Contacts</h2>
              <Link to="/contacts" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass rounded-2xl p-5 h-32 animate-pulse" />
                ))}
              </div>
            ) : recent.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recent.map((contact, i) => (
                  <motion.div
                    key={contact._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                  >
                    <ContactCard contact={contact} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-3xl p-12 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mx-auto mb-4">
        <Users className="w-7 h-7 text-cyan-400" />
      </div>
      <h3 className="font-display font-semibold text-xl text-text-primary mb-2">No contacts yet</h3>
      <p className="text-text-secondary mb-6">Start building your network by adding your first contact.</p>
      <Link to="/contacts/new" className="btn-primary inline-flex items-center gap-2">
        <Plus className="w-4 h-4" /> Add First Contact
      </Link>
    </motion.div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
