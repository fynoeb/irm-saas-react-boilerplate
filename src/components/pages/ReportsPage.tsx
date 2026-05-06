import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { FileText, Download, Eye, Calendar, TrendingUp, Search, Filter, MessageSquare, Phone, X } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Update } from '../../types';
import { AnimatePresence, motion } from 'motion/react';
import { addActivityUpdate } from '../../services/updateService';

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1200 },
];

interface ReportsPageProps {
  updates?: Update[];
  params?: any;
  onParamsHandled?: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ updates = [], params, onParamsHandled }) => {
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Update Form State
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateCategory, setUpdateCategory] = useState<'Update' | 'Call' | 'Report'>('Update');
  const [updateDescription, setUpdateDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim()) return;

    setIsSaving(true);
    try {
      await addActivityUpdate({
        title: updateTitle,
        category: updateCategory,
        description: updateDescription,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        status: updateCategory === 'Report' ? 'Sent' : 'Completed'
      });
      setIsCreateModalOpen(false);
      setUpdateTitle('');
      setUpdateDescription('');
      setUpdateCategory('Update');
    } catch (error) {
      console.error('Failed to create update:', error);
      alert('Gagal membuat aktivitas baru.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUpdates = updates.filter(u => 
    u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (category: string) => {
    switch (category) {
      case 'Report': return <FileText size={20} />;
      case 'Call': return <Phone size={20} />;
      default: return <MessageSquare size={20} />;
    }
  };

  const reports = [
    { title: 'Monthly Update - October 2023', date: 'Oct 01, 2023', type: 'Monthly' },
    { title: 'Q3 Quarterly Board Deck', date: 'Sep 15, 2023', type: 'Quarterly' },
    { title: 'Monthly Update - September 2023', date: 'Sep 01, 2023', type: 'Monthly' },
  ];

  const handleDownloadReport = (report: typeof reports[0]) => {
    const reportContent = `
OFFICIAL INVESTOR REPORT
-----------------------
Title: ${report.title}
Date: ${report.date}
Type: ${report.type}

[Content Preview]
This report contains sensitive financial information and growth metrics for the period ending ${report.date}.
For full details, please contact the founder.

Generated via AngelPipeline Pro
    `;
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">History & Insights</h1>
          <p className="text-slate-500 font-medium">Track all communications and performance metrics.</p>
        </div>
        <div className="flex gap-2">
           <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Add Activity
            </button>
           <div className="relative group ml-2">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent" />
              <input 
                type="text" 
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all w-full md:w-64"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Full Activity Log</h3>
          
          <div className="space-y-3">
            {filteredUpdates.map((update) => (
              <GlassCard 
                key={update.id} 
                onClick={() => setSelectedUpdate(update)}
                className="!p-4 bg-white/60 hover:bg-white/80 border-white/40 group cursor-pointer transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    update.status === 'Completed' || update.status === 'Delivered' 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {getIcon(update.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-base truncate group-hover:text-accent transition-colors">
                        {update.title}
                      </h4>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-tight ml-2">
                        {update.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {update.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${
                        update.status === 'Completed' || update.status === 'Delivered' 
                          ? 'text-emerald-500' 
                          : 'text-indigo-500'
                      }`}>
                        {update.status}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
            {filteredUpdates.length === 0 && (
              <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-slate-200">
                <p className="text-slate-400 font-medium italic">No activity found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Engagement Chart</h3>
            <GlassCard className="h-[250px]">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Official Reports</h3>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.title} className="p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl group hover:border-accent transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-accent transition-colors">{report.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{report.date}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadReport(report);
                      }}
                      className="text-slate-400 hover:text-accent transition-colors active:scale-90"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
                      : 'bg-indigo-50 text-indigo-600'
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
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
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
                    {selectedUpdate.description || `Update activity logged on ${selectedUpdate.date}. Current status: ${selectedUpdate.status}.`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/40 border border-white/20">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Status</span>
                  <span className={`text-sm font-bold uppercase ${
                     selectedUpdate.status === 'Completed' || selectedUpdate.status === 'Delivered' 
                     ? 'text-emerald-600' 
                     : 'text-indigo-600'
                  }`}>
                    {selectedUpdate.status}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-white/40 border border-white/20">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">ID</span>
                  <span className="text-sm font-mono text-slate-600 truncate block">
                    {selectedUpdate.id?.substring(0, 8)}...
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

      {/* Create Activity Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsCreateModalOpen(false)}
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
                  disabled={isSaving}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateActivity} className="space-y-6">
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
                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' 
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
                    disabled={isSaving}
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-4 px-6 bg-accent text-white rounded-2xl font-bold hover:bg-accent-hover transition-all active:scale-95 shadow-xl shadow-accent/20 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Log Activity'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
