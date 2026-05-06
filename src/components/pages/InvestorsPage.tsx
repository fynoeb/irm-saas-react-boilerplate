import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { 
  Search, 
  Filter, 
  Plus, 
  X, 
  Briefcase, 
  User, 
  Info, 
  Calendar, 
  ClipboardCheck, 
  Lock, 
  Check,
  ChevronDown,
  Trash2,
  Edit2,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Investor } from '../../types';
import { subscribeToInvestors, addInvestor, deleteInvestor, updateInvestor } from '../../services/investorService';
import { useAuth } from '../../context/AuthContext';

const STAGE_OPTIONS = [
  { id: 'Leads', label: 'Leads', icon: Search, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Meeting', label: 'Meeting', icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'Due Diligence', label: 'Due Diligence', icon: ClipboardCheck, color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 'Closing', label: 'Closing', icon: Lock, color: 'text-emerald-500', bg: 'bg-emerald-50' },
];

interface InvestorsPageProps {
  params?: any;
  onParamsHandled?: () => void;
}

/**
 * InvestorsPage Component
 * 
 * The primary operations module for Investor Relations.
 * Core Responsibilities:
 * - Investor profiling and lifecycle tracking.
 * - Multi-dimensional data filtering (By Stage, Status).
 * - High-speed search and sorting algorithms.
 * - Data portability (CSV Export).
 */
export const InvestorsPage: React.FC<InvestorsPageProps> = ({ params, onParamsHandled }) => {
  // --- UI Lifecycle Management ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStageDropdownOpen, setIsStageDropdownOpen] = useState(false);
  const stageDropdownRef = useRef<HTMLDivElement>(null);
  
  // --- Real-time Data Management ---
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'firm'; direction: 'asc' | 'desc' } | null>(null);
  const { user } = useAuth();
  
  /**
   * Data Input State
   * Managed via atomic state hooks for immediate reactivity.
   */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [firm, setFirm] = useState('');
  const [type, setType] = useState('VC / Growth');
  const [stage, setStage] = useState('Leads');
  const [status, setStatus] = useState('In Talks');
  const [amount, setAmount] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Deep Link Synchronization
   * Automatically orchestrates component state with navigation parameters
   * provided by external modules (e.g., Dashboard stats).
   */
  useEffect(() => {
    if (params?.editingInvestor) {
      openEditModal(params.editingInvestor);
      onParamsHandled?.();
    } else if (params?.defaultStage) {
      resetForm();
      setStage(params.defaultStage);
      setIsAddModalOpen(true);
      onParamsHandled?.();
    }
  }, [params]);

  // --- Component Lifecycle Hooks ---
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stageDropdownRef.current && !stageDropdownRef.current.contains(event.target as Node)) {
        setIsStageDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateField = (field: string, value: string) => {
    let error = '';
    if (!value.trim()) {
      error = `${field} is required`;
    } else if (field === 'Amount' && !/^[\$\d,.\-kMB\s]+$/.test(value)) {
      error = 'Invalid amount format (e.g. $500k)';
    } else if (value.length < 2) {
      error = `${field} is too short`;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const isFormValid = name.trim() && firm.trim() && amount.trim() && !Object.values(errors).some(e => e !== '');

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToInvestors(setInvestors);
    return unsub;
  }, [user]);

  const [investorToDelete, setInvestorToDelete] = useState<{ id: string, name: string } | null>(null);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setIsSaving(true);
    try {
      const data = {
        name,
        firm,
        type,
        stage: stage as any,
        status: status as any,
        amount,
        nextFollowUp,
        lastContact: editingId ? 'Recently updated' : 'Just now',
        color: 'bg-blue-100 text-blue-800'
      };

      if (editingId) {
        await updateInvestor(editingId, data);
      } else {
        await addInvestor(data);
      }
      
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setInvestorToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!investorToDelete) return;
    setIsSaving(true);
    try {
      await deleteInvestor(investorToDelete.id);
      setInvestorToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus investor.');
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (investor: Investor) => {
    setEditingId(investor.id || null);
    setName(investor.name);
    setFirm(investor.firm);
    setType(investor.type);
    setStage(investor.stage);
    setStatus(investor.status);
    setAmount(investor.amount);
    setNextFollowUp(investor.nextFollowUp || '');
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setFirm('');
    setAmount('');
    setNextFollowUp('');
    setErrors({});
    setTouched({});
    setStage('Leads');
    setStatus('In Talks');
    setType('VC / Growth');
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleSort = (key: 'name' | 'firm') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredInvestors = [...investors].filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         inv.firm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = filterStage === 'All' || inv.stage === filterStage;
    const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
    return matchesSearch && matchesStage && matchesStatus;
  }).sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    if (a[key].toLowerCase() < b[key].toLowerCase()) {
      return direction === 'asc' ? -1 : 1;
    }
    if (a[key].toLowerCase() > b[key].toLowerCase()) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const getSortIcon = (key: 'name' | 'firm') => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="text-slate-300" />;
    return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-accent" /> : <ArrowDown size={14} className="text-accent" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">Active</span>;
      case 'In Talks':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase tracking-wider">In Talks</span>;
      case 'Passed':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Passed</span>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Firm', 'Stage', 'Status', 'Type', 'Amount', 'Last Contact', 'Next Follow-up'];
    const rows = filteredInvestors.map(inv => [
      inv.name,
      inv.firm,
      inv.stage,
      inv.status,
      inv.type,
      inv.amount,
      inv.lastContact,
      inv.nextFollowUp || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `investors_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedStage = STAGE_OPTIONS.find(s => s.id === stage) || STAGE_OPTIONS[0];

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Investor Directory</h1>
          <p className="text-slate-500 font-medium">Manage and track your relationships with investment partners.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all border border-slate-200 active:scale-95 shadow-sm"
          >
            <Download size={20} /> Export
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-blue-900/20 active:scale-95"
          >
            <Plus size={20} /> Add Investor
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, firm, or type..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all text-sm font-medium shadow-sm"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-48">
            <select 
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all text-sm font-medium appearance-none shadow-sm"
            >
              <option value="All">All Stages</option>
              <option value="Leads">Leads</option>
              <option value="Meeting">Meeting</option>
              <option value="Due Diligence">Due Diligence</option>
              <option value="Closing">Closing</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
          <div className="relative w-full sm:w-48">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all text-sm font-medium appearance-none shadow-sm"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="In Talks">In Talks</option>
              <option value="Passed">Passed</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <GlassCard className="overflow-hidden !p-0 border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-100 font-bold">
              <tr>
                <th 
                  className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Investor {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort('firm')}
                >
                  <div className="flex items-center gap-2">
                    Firm {getSortIcon('firm')}
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Follow-up</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredInvestors.map((investor) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={investor.id} 
                    className="group hover:bg-white/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${investor.color || 'bg-slate-100 text-slate-600'}`}>
                          {getInitials(investor.name)}
                        </div>
                        <div>
                          <span className="block font-bold text-slate-800 text-sm leading-none mb-1">{investor.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{investor.lastContact}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-slate-600">{investor.firm}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {investor.stage}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(investor.status)}
                    </td>
                    <td className="px-6 py-5">
                      {investor.nextFollowUp ? (
                        <div className="flex items-center gap-2 text-slate-600 font-bold text-sm">
                          <Calendar size={14} className="text-slate-400" />
                          {investor.nextFollowUp}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(investor)}
                          className="p-2 text-slate-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(investor.id || '', investor.name)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {filteredInvestors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No investors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Add Investor Drawer */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full max-w-md glass border-l border-white/20 z-[101] shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Investor' : 'Add Investor'}</h2>
                  <p className="text-slate-500 text-sm font-medium">{editingId ? 'Update details for this partner' : 'Fill in the details to add a new contact.'}</p>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 hide-scrollbar">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <User size={14} /> Full Name
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (touched.Name) validateField('Name', e.target.value);
                      }}
                      onBlur={(e) => handleBlur('Name', e.target.value)}
                      placeholder="e.g. John Doe"
                      className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm font-medium ${
                        errors.Name && touched.Name ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-accent/20 focus:border-accent'
                      }`}
                    />
                    {errors.Name && touched.Name && <p className="text-[10px] font-bold text-rose-500 uppercase ml-1 tracking-wider">{errors.Name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Briefcase size={14} /> Investment Firm
                    </label>
                    <input 
                      type="text" 
                      required
                      value={firm}
                      onChange={(e) => {
                        setFirm(e.target.value);
                        if (touched.Firm) validateField('Firm', e.target.value);
                      }}
                      onBlur={(e) => handleBlur('Firm', e.target.value)}
                      placeholder="e.g. Sequoia Capital"
                      className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm font-medium ${
                        errors.Firm && touched.Firm ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-accent/20 focus:border-accent'
                      }`}
                    />
                    {errors.Firm && touched.Firm && <p className="text-[10px] font-bold text-rose-500 uppercase ml-1 tracking-wider">{errors.Firm}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type</label>
                      <div className="relative">
                        <select 
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium appearance-none"
                        >
                          <option>VC / Growth</option>
                          <option>Angel</option>
                          <option>Accelerator</option>
                          <option>Strategic</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                    
                    <div className="space-y-2" ref={stageDropdownRef}>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stage</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsStageDropdownOpen(!isStageDropdownOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium"
                        >
                          <div className="flex items-center gap-2">
                            <selectedStage.icon size={16} className={selectedStage.color} />
                            <span className="text-slate-700">{selectedStage.label}</span>
                          </div>
                          <ChevronDown className={`text-slate-400 transition-transform ${isStageDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                        </button>

                        <AnimatePresence>
                          {isStageDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              className="absolute top-full mt-2 left-0 w-full glass border border-white/20 rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                              <div className="p-1">
                                {STAGE_OPTIONS.map((option) => (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => {
                                      setStage(option.id);
                                      setIsStageDropdownOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                                      stage === option.id ? 'bg-accent/5 text-accent font-bold' : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`p-1.5 rounded-lg ${option.bg}`}>
                                        <option.icon size={16} className={option.color} />
                                      </div>
                                      <span>{option.label}</span>
                                    </div>
                                    {stage === option.id && <Check size={16} />}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</label>
                    <div className="relative">
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium appearance-none"
                      >
                        <option>In Talks</option>
                        <option>Active</option>
                        <option>Passed</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} /> Next Follow-up
                    </label>
                    <input 
                      type="date" 
                      value={nextFollowUp}
                      onChange={(e) => setNextFollowUp(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Ticket Size</label>
                    <input 
                      type="text" 
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (touched.Amount) validateField('Amount', e.target.value);
                      }}
                      onBlur={(e) => handleBlur('Amount', e.target.value)}
                      placeholder="e.g. $500k - $1.5M"
                      className={`w-full px-4 py-3 bg-slate-50/50 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm font-medium ${
                        errors.Amount && touched.Amount ? 'border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:ring-accent/20 focus:border-accent'
                      }`}
                    />
                    {errors.Amount && touched.Amount && <p className="text-[10px] font-bold text-rose-500 uppercase ml-1 tracking-wider">{errors.Amount}</p>}
                  </div>
                </div>

                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-1 py-3 px-6 glass rounded-xl text-slate-600 font-bold hover:bg-white transition-all disabled:opacity-50"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 px-6 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                    disabled={isSaving || !isFormValid}
                  >
                    {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Investor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Custom Delete Confirmation Modal */}
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
    </div>
  );
};
