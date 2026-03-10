import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Layers, TrendingUp, UserCheck, UserX,
  Search, Trash2, Eye, ToggleLeft, ToggleRight, LogOut,
  BarChart2, AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    adminAPI.getStats()
      .then((r) => setStats(r.data.stats))
      .catch(() => toast.error('Failed to load stats'));
  }, []);

  useEffect(() => {
    if (tab !== 'users') return;
    setLoading(true);
    adminAPI.getUsers({ search, page, limit: 15 })
      .then((r) => { setUsers(r.data.users); setPagination(r.data.pagination); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [tab, search, page]);

  const handleToggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUserStatus(id);
      setUsers((u) => u.map((x) => x._id === id ? { ...x, isActive: res.data.isActive } : x));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update user'); }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Permanently delete "${name}" and ALL their contacts? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers((u) => u.filter((x) => x._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete user'); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-void">
      {/* Admin header */}
      <header className="glass border-b border-violet-500/20 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-text-primary leading-tight">Admin Panel</h1>
              <p className="text-xs text-violet-400 font-mono">SYSTEM CONTROL</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all text-sm">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {[['overview', BarChart2, 'Overview'], ['users', Users, 'Users']].map(([t, Icon, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-display font-semibold border-b-2 transition-all -mb-px
                ${tab === t ? 'border-violet-400 text-violet-400' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!stats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-28 animate-pulse" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-cyan-400 bg-cyan-400/10' },
                    { label: 'Total Contacts', value: stats.totalContacts, icon: Layers, color: 'text-violet-400 bg-violet-400/10' },
                    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'text-emerald-400 bg-emerald-400/10' },
                    { label: 'Inactive Users', value: stats.inactiveUsers, icon: UserX, color: 'text-rose-400 bg-rose-400/10' },
                  ].map(({ label, value, icon: Icon, color }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="glass rounded-2xl p-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="font-display font-bold text-3xl text-text-primary">{value}</p>
                      <p className="text-text-secondary text-sm mt-1">{label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Avg contacts */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-violet-400" /> Contact Stats
                    </h3>
                    <div className="space-y-3">
                      <Row label="Avg contacts per user" value={stats.avgContactsPerUser} />
                      <Row label="Max contacts by one user" value={stats.maxContactsByUser} />
                    </div>
                  </div>

                  {/* Recent users */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" /> Recent Signups
                    </h3>
                    <div className="space-y-3">
                      {stats.recentUsers?.map((u) => (
                        <div key={u._id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-text-primary truncate">{u.name}</p>
                            <p className="text-xs text-text-muted truncate">{u.email}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                            {u.isActive ? 'active' : 'inactive'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Users tab */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search */}
            <div className="relative mb-6 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input className="input-field pl-10 py-2.5 text-sm" placeholder="Search users..."
                value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>

            <div className="glass rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left">
                      {['User', 'Email', 'Contacts', 'Status', 'Joined', 'Actions'].map((h) => (
                        <th key={h} className="px-5 py-4 text-xs font-mono text-text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-6 bg-surface rounded animate-pulse" /></td></tr>
                      ))
                    ) : users.map((u) => (
                      <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {u.name[0]}
                            </div>
                            <span className="text-sm text-text-primary font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-text-secondary font-mono">{u.email}</td>
                        <td className="px-5 py-4 text-sm text-text-secondary">{u.contactCount || 0}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${u.isActive ? 'bg-emerald-400/10 text-emerald-400' : 'bg-rose-400/10 text-rose-400'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleToggleUser(u._id)}
                              className={`p-2 rounded-lg border transition-all ${u.isActive ? 'border-border text-text-muted hover:text-amber-400 hover:border-amber-400/40' : 'border-border text-text-muted hover:text-emerald-400 hover:border-emerald-400/40'}`}
                              title={u.isActive ? 'Deactivate' : 'Activate'}>
                              {u.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-2 rounded-lg border border-border text-text-muted hover:text-rose-400 hover:border-rose-400/40 transition-all"
                              title="Delete user">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!loading && users.length === 0 && (
                <div className="p-12 text-center text-text-muted">No users found</div>
              )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4 text-sm text-text-muted">
                <span>{pagination.total} total users</span>
                <div className="flex gap-2">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-lg border text-sm transition-all
                        ${page === i + 1 ? 'border-violet-400/40 text-violet-400 bg-violet-400/10' : 'border-border hover:border-muted'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="font-display font-bold text-text-primary">{value}</span>
    </div>
  );
}
