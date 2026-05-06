import React, { useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { User, Bell, Shield, Wallet, Check, Trash2, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

type SettingsTab = 'profile' | 'notifications' | 'security';

/**
 * SettingsPage Component
 * 
 * Provides administrative controls for the user profile, 
 * notification preferences, and account security.
 */
export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  
  // --- Navigation & State ---
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [fullName, setFullName] = useState(user?.displayName || 'Alex Thompson');
  const [email, setEmail] = useState(user?.email || 'alex@company.com');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  /**
   * Notification Matrix
   * Toggles for real-time alerting system.
   */
  const [notificationSettings, setNotificationSettings] = useState({
    leads: true,
    views: true,
    summary: false
  });

  /**
   * Action: Toggle single notification preference
   */
  const toggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  /**
   * Action: Persistence Logic
   * Saves updated profile and notification settings to the database.
   */
  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call and log the settings being saved
    console.log('Saving settings:', { fullName, notificationSettings });
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('Account deleted. Redirecting...');
    logout();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-slate-800">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-slate-400 cursor-not-allowed text-sm font-medium"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Biography</label>
                <textarea 
                  rows={4}
                  defaultValue="Founder & CEO at Modern SaaS Co. Building the future of investor relations."
                  className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm resize-none font-medium"
                />
              </div>
            </div>
          </motion.div>
        );
      case 'notifications':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-slate-800">Email Notifications</h3>
            <div className="space-y-4">
              {[
                { id: 'leads', title: 'New Investor Lead', desc: 'Notify me when an investor shows interest.' },
                { id: 'views', title: 'Update Viewed', desc: 'Notify me when someone views an update report.' },
                { id: 'summary', title: 'Monthly Summary', desc: 'Send me a monthly analytics roundup.' },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotification(item.id as keyof typeof notificationSettings)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      notificationSettings[item.id as keyof typeof notificationSettings] ? 'bg-accent' : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    <span className={`${
                      notificationSettings[item.id as keyof typeof notificationSettings] ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-bold text-slate-800">Password & Security</h3>
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-sm font-medium" />
              </div>
              <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl">
                <AlertTriangle size={18} className="shrink-0" />
                <p className="text-xs font-medium">To change your email address, please contact support.</p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Account Settings</h1>
          <p className="text-slate-500 font-medium">Manage your profile, team permissions, and notification preferences.</p>
        </div>
        
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20"
            >
              <Check size={16} /> Changes Saved Successfully
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'profile', icon: User, label: 'Profile' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'security', icon: Shield, label: 'Security' },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6 pb-20">
          <GlassCard className="space-y-6">
            {renderTabContent()}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 active:scale-[0.98] transform-gpu"
              >
                {isSaving ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </GlassCard>

          <GlassCard className="border-rose-100 bg-rose-50/10">
            <h3 className="text-lg font-bold text-rose-900 mb-2">Danger Zone</h3>
            <p className="text-sm text-rose-600 font-medium mb-4">Deleting your account is permanent and cannot be undone.</p>
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-6 py-3 border-2 border-rose-200 text-rose-500 rounded-xl font-bold hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all text-sm active:scale-[0.98] transform-gpu"
            >
              Delete Account
            </button>
          </GlassCard>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSaving && setIsDeleteModalOpen(false)}
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
                <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Akun?</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">
                  Apakah Anda yakin ingin menghapus akun Anda? Seluruh data investasi Anda akan dihapus secara permanen.
                </p>
                <div className="flex gap-4">
                  <button 
                    disabled={isSaving}
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 px-6 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    disabled={isSaving}
                    onClick={handleDeleteAccount}
                    className="flex-1 py-3 px-6 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
                  >
                    {isSaving ? 'Menghapus...' : 'Hapus'}
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

