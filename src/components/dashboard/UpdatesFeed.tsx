import React from 'react';
import { Update } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { FileText, Phone, MessageSquare, ChevronRight } from 'lucide-react';

interface UpdatesFeedProps {
  updates: Update[];
  onViewHistory?: () => void;
  onCreateUpdate?: () => void;
  onUpdateClick?: (update: Update) => void;
}

export const UpdatesFeed: React.FC<UpdatesFeedProps> = ({ 
  updates, 
  onViewHistory, 
  onCreateUpdate,
  onUpdateClick
}) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Report': return <FileText size={16} />;
      case 'Call': return <Phone size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  return (
    <GlassCard id="updates-feed" className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Recent activity</h2>
        <button 
          onClick={onViewHistory}
          className="text-xs text-slate-400 hover:text-accent font-bold flex items-center gap-1 uppercase tracking-wider transition-colors"
        >
          View History <ChevronRight size={14} />
        </button>
      </div>

      <div className="space-y-6">
        {updates.map((update, idx) => (
          <div 
            key={update.id} 
            onClick={() => onUpdateClick?.(update)}
            className="relative flex gap-4 group cursor-pointer"
          >
            {idx !== updates.length - 1 && (
              <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-slate-100"></div>
            )}
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
              update.status === 'Completed' || update.status === 'Delivered' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-blue-50 text-blue-800'
            }`}>
              {getIcon(update.category)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-accent transition-colors">{update.title}</h4>
                <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap ml-2 uppercase tracking-tight">
                  {update.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{update.category}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${
                  update.status === 'Completed' || update.status === 'Delivered' 
                    ? 'text-emerald-600' 
                    : 'text-blue-800'
                }`}>
                  {update.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {updates.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-4 font-medium italic">No recent activity.</p>
        )}
      </div>

      <button 
        onClick={onCreateUpdate}
        className="w-full mt-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm transition-all duration-300 hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95"
      >
        Create New Update
      </button>
    </GlassCard>
  );
};
