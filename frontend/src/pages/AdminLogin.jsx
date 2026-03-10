import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!adminSecret.trim()) {
      setError('Admin access key is required.');
      return;
    }
    setLoading(true);
    try {
      // Store admin secret in sessionStorage (cleared when tab closes)
      sessionStorage.setItem('cms_admin_secret', adminSecret);
      const user = await login(email, password);
      if (user.role !== 'admin') {
        sessionStorage.removeItem('cms_admin_secret');
        setError('Access denied. Admin privileges required.');
        return;
      }
      toast.success('Admin panel accessed');
      navigate('/admin/dashboard');
    } catch (err) {
      sessionStorage.removeItem('cms_admin_secret');
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ominous bg */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.06)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
      <div className="orbit w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 !border-violet-500/10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center"
          >
            <Shield className="w-8 h-8 text-violet-400" />
          </motion.div>
        </div>

        <div className="glass-strong rounded-3xl p-8 border-violet-500/20">
          <div className="text-center mb-6">
            <h1 className="font-display font-bold text-2xl text-text-primary">Restricted Access</h1>
            <p className="text-text-muted text-sm mt-1 font-mono">System Administration Panel</p>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300/80 text-xs font-body leading-relaxed">
              This area is restricted to authorized administrators only. Unauthorized access attempts are logged.
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 mb-4">
                <p className="text-rose-400 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-text-muted block mb-1.5">ADMIN EMAIL</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field text-sm" placeholder="admin@example.com" required />
            </div>

            <div>
              <label className="text-xs font-mono text-text-muted block mb-1.5">PASSWORD</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field text-sm pr-10" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-text-muted block mb-1.5">ADMIN ACCESS KEY</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input type="password" value={adminSecret} onChange={(e) => setAdminSecret(e.target.value)}
                  className="input-field pl-10 text-sm font-mono" placeholder="Enter secret key" required />
              </div>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-display font-semibold
                         flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                <>Authenticate <ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
