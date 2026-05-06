import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StatCard } from './StatCard';
import { Pipeline } from './Pipeline';
import { UpdatesFeed } from './UpdatesFeed';
import { Metric, Investor, Update } from '../../types';
import { Trash2, X, Phone, MessageSquare, FileText } from 'lucide-react';
import { subscribeToMetrics } from '../../services/metricService';
import { subscribeToInvestors, deleteInvestor } from '../../services/investorService';
import { subscribeToUpdates, addActivityUpdate } from '../../services/updateService';
import { useAuth } from '../../context/AuthContext';

/**
 * DashboardContent Component
 * 
 * The primary executive summary module.
 * Aggregates real-time CRM data for visualization and key performance tracking.
 * 
 * @param onNavigate - Delegate for cross-module navigation.
 * @param updates - Real-time activity feed data.
 */
export const DashboardContent: React.FC<{ 
  onNavigate?: (page: string, params?: any) => void;
  updates?: Update[];
}> = ({ onNavigate, updates = [] }) => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const { user } = useAuth();

  const metrics = React.useMemo(() => {
    const parseAmount = (amt: string): number => {
      if (!amt) return 0;
      const clean = amt.replace('$', '').toLowerCase();
      if (clean.includes('k')) return parseFloat(clean.replace('k', '')) * 1000;
      if (clean.includes('m')) return parseFloat(clean.replace('m', '')) * 1000000;
      if (clean.includes('b')) return parseFloat(clean.replace('b', '')) * 1000000000;
      return parseFloat(clean) || 0;
    };

    const formatAmount = (val: number): string => {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
      return `$${val}`;
    };

    const totalPipeline = investors
      .filter(i => i.status !== 'Passed')
      .reduce((sum, i) => sum + parseAmount(i.amount), 0);

    const activeInvestors = investors.filter(i => i.status === 'Active').length;
    const inTalks = investors.filter(i => i.status === 'In Talks').length;
    const closingCount = investors.filter(i => i.stage === 'Closing').length;
    const conversionRate = investors.length > 0 ? Math.round((closingCount / investors.length) * 100) : 0;

    return [
      {
        label: 'Total Investors',
        value: investors.length.toString(),
        change: '+4%',
        isPositive: true,
        iconName: 'Users'
      },
      {
        label: 'Pipeline Value',
        value: formatAmount(totalPipeline),
        change: '+15%',
        isPositive: true,
        iconName: 'DollarSign'
      },
      {
        label: 'In Talks',
        value: inTalks.toString(),
        change: '-2',
        isPositive: false,
        iconName: 'MessageSquare'
      },
      {
        label: 'Conv. Rate',
        value: `${conversionRate}%`,
        change: '+5%',
        isPositive: true,
        iconName: 'TrendingUp'
      }
    ] as Metric[];
  }, [investors]);

  const [investorToDelete, setInvestorToDelete] = useState<{ id: string, name: string } | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);

  // New Update Form State
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateCategory, setUpdateCategory] = useState<'Update' | 'Call' | 'Report'>('Update');
  const [updateDescription, setUpdateDescription] = useState('');
  const [isSavingUpdate, setIsSavingUpdate] = useState(false);

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim()) return;

    setIsSavingUpdate(true);
    try {
      await addActivityUpdate({
        title: updateTitle,
        category: updateCategory,
        description: updateDescription,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: updateCategory === 'Report' ? 'Sent' : 'Completed'
      });
      setIsCreateUpdateModalOpen(false);
      setUpdateTitle('');
      setUpdateDescription('');
      setUpdateCategory('Update');
    } catch (error) {
      console.error('Failed to create update:', error);
      alert('Gagal membuat aktivitas baru.');
    } finally {
      setIsSavingUpdate(false);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Report': return <FileText size={20} />;
      case 'Call': return <Phone size={20} />;
      default: return <MessageSquare size={20} />;
    }
  };

  const handleDeleteLead = (id: string, name: string) => {
    if (!id) {
      console.warn('Cannot delete investor without a valid ID. Investor name:', name);
      return;
    }
    setInvestorToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!investorToDelete) return;

    try {
      console.log(`Starting deletion for investor ID: ${investorToDelete.id}`);
      await deleteInvestor(investorToDelete.id);
      console.log(`Successfully deleted investor: ${investorToDelete.name}`);
      setInvestorToDelete(null);
    } catch (err) {
      console.error('Failed to delete lead:', err);
      alert('Gagal menghapus investor. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    if (!user) return;

    const unsubInvestors = subscribeToInvestors(setInvestors);

    return () => {
      unsubInvestors();
    };
  }, [user]);

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2"
          >
            Good morning, {user?.displayName?.split(' ')[0] || 'Alex'}.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-base text-slate-500 font-medium"
          >
            Here's what's happening with your investor relations today.
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <button 
            onClick={() => onNavigate?.('reports')}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Create Report
          </button>
          <button 
            onClick={() => onNavigate?.('investors')}
            className="px-4 py-2.5 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent-hover transition-all active:scale-95 shadow-lg shadow-blue-900/20"
          >
            Add Investor
          </button>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6"
      >
        {metrics.map((metric) => (
          <StatCard 
            key={metric.label} 
            metric={metric} 
            onClick={() => {
              if (metric.label.toLowerCase().includes('value') || metric.label.toLowerCase().includes('roi')) {
                onNavigate?.('portfolio');
              } else {
                onNavigate?.('investors');
              }
            }}
          />
        ))}
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-4">
        {/* Left/Middle Column (Pipeline) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 overflow-hidden"
        >
          <Pipeline 
            investors={investors} 
            onViewAll={() => onNavigate?.('investors')} 
            onAddLead={(stage) => onNavigate?.('investors', { defaultStage: stage })}
            onEditLead={(investor) => onNavigate?.('investors', { editingInvestor: investor })}
            onDeleteLead={handleDeleteLead}
          />
        </motion.div>

        {/* Right Column (Updates & Activity) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <UpdatesFeed 
            updates={updates} 
            onViewHistory={() => onNavigate?.('reports')} 
            onCreateUpdate={() => setIsCreateUpdateModalOpen(true)}
            onUpdateClick={setSelectedUpdate}
          />
        </motion.div>
      </div>

      {/* Activity Detail Modal */}
      <AnimatePresence>
        {selectedUpdate && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUpdate(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1000]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass border border-white/40 p-8 rounded-3xl shadow-2xl z-[1001]"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    selectedUpdate.status === 'Completed' || selectedUpdate.status === 'Delivered' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-blue-50 text-blue-800'
                  }`}>
                    {getIcon(selectedUpdate.category)}
                  </div>
                  <button 
                    onClick={() => setSelectedUpdate(null)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
              </div>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-800 bg-blue-50 px-2 py-1 rounded-lg">
                    {selectedUpdate.category}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                    {selectedUpdate.date}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-4">
                  {selectedUpdate.title}
                </h2>
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-white/40">
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {selectedUpdate.description || `Aktivitas ini dilakukan pada ${selectedUpdate.date}. Status saat ini adalah ${selectedUpdate.status}.`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/40 border border-white/20">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Status</span>
                  <span className={`text-base font-bold uppercase ${
                     selectedUpdate.status === 'Completed' || selectedUpdate.status === 'Delivered' 
                     ? 'text-emerald-600' 
                     : 'text-blue-800'
                  }`}>
                    {selectedUpdate.status}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 border border-white/20">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Kategori</span>
                  <span className="text-base font-bold text-slate-800">
                    {selectedUpdate.category}
                  </span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUpdate(null)}
                className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
              >
                Tutup Detail
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create Activity Update Modal */}
      <AnimatePresence>
        {isCreateUpdateModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSavingUpdate && setIsCreateUpdateModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1000]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg glass border border-white/40 p-8 rounded-3xl shadow-2xl z-[1001]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Log New Activity</h3>
                <button 
                  disabled={isSavingUpdate}
                  onClick={() => setIsCreateUpdateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUpdate} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Activity Title</label>
                  <input 
                    type="text"
                    required
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="e.g., Follow up call with Seed Bridge"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Update', 'Call', 'Report'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setUpdateCategory(cat)}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                          updateCategory === cat 
                            ? 'bg-accent text-white border-accent shadow-lg shadow-blue-900/20' 
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description / Notes</label>
                  <textarea 
                    rows={4}
                    value={updateDescription}
                    onChange={(e) => setUpdateDescription(e.target.value)}
                    placeholder="Describe the outcome or details of this activity..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    disabled={isSavingUpdate}
                    onClick={() => setIsCreateUpdateModalOpen(false)}
                    className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSavingUpdate}
                    className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-xl shadow-blue-900/20 disabled:opacity-50"
                  >
                    {isSavingUpdate ? 'Saving...' : 'Log Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {investorToDelete && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInvestorToDelete(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1000]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm glass border border-white/40 p-8 rounded-3xl shadow-2xl z-[1001]"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Investor?</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">
                  Apakah Anda yakin ingin menghapus <span className="text-slate-800 font-bold">"{investorToDelete.name}"</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setInvestorToDelete(null)}
                    className="flex-1 py-3 px-6 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 px-6 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
