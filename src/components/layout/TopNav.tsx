import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, Menu, LogOut, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface TopNavProps {
  onMenuClick: () => void;
  onPageChange?: (page: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick, onPageChange }) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    { id: 1, text: 'New investor interest from Benchmark', time: '5m ago', unread: true },
    { id: 2, text: 'Monthly report delivered to 45 investors', time: '1h ago', unread: false },
    { id: 3, text: 'Meeting scheduled with Sarah Jenkins', time: '3h ago', unread: false },
  ];

  return (
    <header id="top-nav" className="h-20 flex items-center justify-between px-4 sm:px-8 bg-[#f8fafc]/80 sticky top-0 z-40 backdrop-blur-md border-b border-slate-200/50">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 lg:hidden text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div id="search-bar" className="relative group w-48 sm:w-64 md:w-96 hidden xs:flex">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search keywords..." 
            className="w-full pl-10 sm:pl-12 pr-4 py-2 bg-white/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div id="user-actions" className="flex items-center gap-2 sm:gap-4">
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 sm:p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-accent hover:border-accent transition-all relative flex items-center justify-center active:scale-95 shadow-sm"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full scale-110"></span>
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-2 right-0 w-80 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100/50 flex justify-between items-center bg-slate-50/30">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Notifications</h3>
                  <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">3 New</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                      <p className={`text-sm font-semibold ${notif.unread ? 'text-slate-900' : 'text-slate-500'} group-hover:text-accent transition-colors`}>{notif.text}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    onPageChange?.('notifications');
                    setIsNotifOpen(false);
                  }}
                  className="w-full py-3 text-center text-xs font-bold text-slate-500 hover:text-accent bg-slate-50/30 transition-colors uppercase tracking-widest border-t border-slate-100/50"
                >
                  View All Notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-1 pr-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-accent transition-all group active:scale-95"
          >
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-accent transition-colors shrink-0 overflow-hidden shadow-sm">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-none mb-1 line-clamp-1">{user?.displayName || 'User'}</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-tight">Founder</p>
            </div>
            <ChevronDown className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} size={14} />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-2 right-0 w-56 bg-white/95 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-2 border-b border-slate-100/50 bg-slate-50/30">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-1">Logged in as</p>
                  <p className="text-sm font-bold text-slate-800 px-3 truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      onPageChange?.('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                  >
                    <SettingsIcon size={16} className="text-slate-400" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 font-bold text-sm hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
