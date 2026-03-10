import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Edit3 } from 'lucide-react';
import { contactAPI } from '../services/api';
import ContactForm from '../components/Contact/ContactForm';
import Sidebar from '../components/Layout/Sidebar';
import toast from 'react-hot-toast';

export default function ContactEdit() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'new';
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    contactAPI.getOne(id)
      .then((res) => {
        const c = res.data.contact;
        setInitial({ ...c, tags: c.tags?.join(', ') || '' });
      })
      .catch(() => { toast.error('Contact not found'); navigate('/contacts'); })
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await contactAPI.update(id, data);
        toast.success('Contact updated!');
        navigate(`/contacts/${id}`);
      } else {
        const res = await contactAPI.create(data);
        toast.success('Contact created!');
        navigate(`/contacts/${res.data.contact._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-void">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-text-muted hover:text-text-secondary transition-colors mb-4 text-sm">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                {isEdit ? <Edit3 className="w-5 h-5 text-cyan-400" /> : <UserPlus className="w-5 h-5 text-cyan-400" />}
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl text-text-primary">
                  {isEdit ? 'Edit Contact' : 'New Contact'}
                </h1>
                <p className="text-text-secondary text-sm mt-0.5">
                  {isEdit ? 'Update contact information' : 'Add a new contact to your network'}
                </p>
              </div>
            </div>
          </motion.div>

          {fetching ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-6 h-32 animate-pulse" />
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <ContactForm
                initial={initial || {}}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
                loading={loading}
              />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
