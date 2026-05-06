import React, { useState, useRef, useEffect } from 'react';
import { Investor } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { MoreHorizontal, Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

const STAGES = ['Leads', 'Meeting', 'Due Diligence', 'Closing'] as const;

interface PipelineProps {
  investors: Investor[];
  onViewAll?: () => void;
  onAddLead?: (stage: string) => void;
  onEditLead?: (investor: Investor) => void;
  onDeleteLead?: (id: string, name: string) => void;
}

export const Pipeline: React.FC<PipelineProps> = ({ 
  investors, 
  onViewAll, 
  onAddLead,
  onEditLead,
  onDeleteLead
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <section id="pipeline-section" className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Investor Pipeline</h2>
        <button 
          onClick={onViewAll}
          className="text-sm font-bold text-accent hover:underline cursor-pointer"
        >
          View All
        </button>
      </div>
      
      <div id="pipeline-columns" className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth">
        {STAGES.map((stage) => {
          const stageInvestors = investors.filter(inv => inv.stage === stage);
          
          return (
            <div key={stage} className="flex flex-col gap-4 min-w-[280px] w-[280px] shrink-0">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{stage}</h3>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {stageInvestors.length}
                </span>
              </div>
              
              <div id={`column-${stage}`} className="flex flex-col gap-3">
                {stageInvestors.map((investor) => (
                  <GlassCard key={investor.id} className="!p-4 bg-white/60 hover:bg-white/80 border-white/40 group cursor-pointer transition-all relative">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-800 leading-tight group-hover:text-accent transition-colors">{investor.name}</h4>
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === investor.id ? null : (investor.id || null));
                          }}
                          className={`p-1 rounded-lg transition-colors ${activeMenuId === investor.id ? 'bg-accent/10 text-accent' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        <AnimatePresence>
                          {activeMenuId === investor.id && (
                            <motion.div
                              ref={menuRef}
                              initial={{ opacity: 0, scale: 0.95, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 10 }}
                              className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                              <div className="p-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditLead?.(investor);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-accent transition-all"
                                >
                                  <Edit2 size={14} /> Edit Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onViewAll?.();
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                  <ExternalLink size={14} /> Full View
                                </button>
                                <div className="h-px bg-slate-100 my-1" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const investorId = investor.id;
                                    const investorName = investor.name;
                                    console.log('Remove button clicked for:', investorName, 'ID:', investorId);
                                    
                                    if (investorId) {
                                      onDeleteLead?.(investorId, investorName);
                                    } else {
                                      console.error('CRITICAL: Investor ID is missing for:', investorName);
                                      alert('Error: ID Investor tidak ditemukan. Data mungkin belum tersinkronisasi.');
                                    }
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                  <Trash2 size={14} /> Remove
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 font-medium">{investor.firm}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className="text-sm font-bold text-slate-800 tracking-tight">{investor.amount}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{investor.lastContact}</span>
                    </div>
                  </GlassCard>
                ))}
                
                <button 
                  onClick={() => onAddLead?.(stage)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-accent hover:text-accent transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Lead
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
