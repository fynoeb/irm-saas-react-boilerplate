import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { Bell, Check, Trash2, Calendar, MessageSquare, TrendingUp, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'interest' | 'update' | 'system' | 'meeting';
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: 1, 
      title: 'New investor interest', 
      description: 'Benchmark has flagged your profile as "High Potential" following your latest deck update.', 
      time: '5 minutes ago', 
      unread: true,
      type: 'interest'
    },
    { 
      id: 2, 
      title: 'Monthly report delivered', 
      description: 'Your April Investor Update has been successfully delivered to 45 stakeholders.', 
      time: '1 hour ago', 
      unread: false,
      type: 'update'
    },
    { 
      id: 3, 
      title: 'Meeting scheduled', 
      description: 'Intro call with Sarah Jenkins from Sequoia Capital confirmed for tomorrow at 10:00 AM.', 
      time: '3 hours ago', 
      unread: false,
      type: 'meeting'
    },
    { 
      id: 4, 
      title: 'Data room accessed', 
      description: 'Multiple documents were downloaded by the Due Diligence team at First Round.', 
      time: 'Yesterday', 
      unread: false,
      type: 'system'
    },
    { 
      id: 5, 
      title: 'Portfolio benchmark update', 
      description: 'Your growth metrics are now in the top 10% of our aggregated SaaS portfolio.', 
      time: '2 days ago', 
      unread: false,
      type: 'system'
    },
  ]);

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'interest': return <TrendingUp size={20} />;
      case 'update': return <MessageSquare size={20} />;
      case 'meeting': return <Calendar size={20} />;
      default: return <Info size={20} />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'interest': return 'bg-emerald-50 text-emerald-600';
      case 'update': return 'bg-indigo-50 text-indigo-600';
      case 'meeting': return 'bg-amber-50 text-amber-600';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Notifications</h1>
          <p className="text-slate-500 font-medium">Clear communication is key to successful investor relations.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          <Check size={18} /> Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <GlassCard className={`group relative transition-all ${notif.unread ? 'border-l-4 border-l-accent' : ''}`}>
                <div className="flex gap-6">
                  <div className={`p-3 rounded-2xl shrink-0 h-fit ${getIconColor(notif.type)}`}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <h3 className={`font-bold text-slate-900 group-hover:text-accent transition-colors ${notif.unread ? '' : 'opacity-80'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                        {notif.time}
                      </span>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed mb-4 ${notif.unread ? 'text-slate-600' : 'text-slate-400 font-normal'}`}>
                      {notif.description}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      {notif.unread && (
                        <button 
                          onClick={() => markAsRead(notif.id)}
                          className="text-xs font-bold text-accent hover:underline uppercase tracking-tighter"
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(notif.id)}
                        className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-tighter"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-[32px] flex items-center justify-center mx-auto mb-6">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">All caught up</h3>
            <p className="text-slate-400 font-medium">You have no new notifications at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};
