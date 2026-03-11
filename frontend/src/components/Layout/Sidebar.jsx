import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, LayoutDashboard, Users, Star, Settings,
  LogOut, Menu, X, ChevronRight, Tag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'All Contacts', path: '/contacts' },
  { icon: Star, label: 'Favorites', path: '/contacts?isFavorite=true' },
  { icon: Tag, label: 'Categories', path: '/contacts?view=categories' },
  // { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname + location.search === path || location.pathname === path.split('?')[0] && path === location.pathname;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)] shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-display font-bold text-lg text-text-primary leading-tight block">NexLinK2I</span>
          <span className="text-xs text-text-muted font-mono">v2.0</span>
        </div>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-surface">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-display font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-body font-semibold text-text-primary text-sm truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate font-mono">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-mono text-text-muted px-4 pb-2 uppercase tracking-widest">Navigation</p>
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setMobileOpen(false)}
            className={`nav-item ${isActive(path) ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive(path) && <ChevronRight className="w-3 h-3" />}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 border-t border-border pt-4">
        <button onClick={handleLogout}
          className="nav-item w-full hover:text-rose-400 hover:bg-rose-500/10">
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass border-r border-border h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 glass rounded-xl flex items-center justify-center border border-border"
      >
        <Menu className="w-5 h-5 text-text-secondary" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 glass-strong border-r border-border z-50 flex flex-col"
            >
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-border flex items-center justify-center text-text-muted hover:text-text-primary">
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
