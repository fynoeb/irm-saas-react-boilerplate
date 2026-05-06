import React from 'react';
import { LayoutDashboard, Users, PieChart, FileText, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

/**
 * Sidebar Component
 * 
 * Provides navigation control and visual orientation for the platform.
 * Implements responsive visibility toggles for dual-screen environments.
 * 
 * @param isOpen - Control state for mobile navigation visibility.
 * @param onClose - Handler for dismissal events.
 * @param currentPage - The dynamic identifier of the active view.
 * @param onPageChange - Sink for navigation transition events.
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentPage, onPageChange }) => {
  const { logout } = useAuth();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard' },
    { icon: Users, label: 'Investors', id: 'investors' },
    { icon: PieChart, label: 'Portfolio', id: 'portfolio' },
    { icon: FileText, label: 'Reports', id: 'reports' },
    { icon: Bell, label: 'Notifications', id: 'notifications' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[55] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        id="sidebar-container" 
        className={`fixed top-0 left-0 h-screen w-64 glass border-r border-white/20 z-[60] flex flex-col p-6 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div id="sidebar-logo" className="flex items-center justify-between mb-12 px-2 group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/30 group-hover:scale-110 transition-transform">
              <PieChart size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">IR Manage</span>
          </div>
        </div>

        <nav id="sidebar-nav" className="flex-1 space-y-2 text-left">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                onClose(); // Auto-close on mobile
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-left ${
                currentPage === item.id 
                  ? 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] text-accent font-bold scale-[1.02]' 
                  : 'text-slate-400 hover:bg-white/40 hover:text-slate-700'
              }`}
            >
              <item.icon size={20} className={currentPage === item.id ? 'text-accent' : 'text-slate-400 group-hover:text-slate-600'} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div id="sidebar-footer" className="mt-auto border-t border-white/20 pt-6">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
