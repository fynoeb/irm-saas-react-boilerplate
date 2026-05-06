/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { DashboardContent } from './components/dashboard/DashboardContent';
import { InvestorsPage } from './components/pages/InvestorsPage';
import { PortfolioPage } from './components/pages/PortfolioPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { LoginPage } from './components/pages/LoginPage';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { seedInitialInvestors } from './services/investorService';
import { seedInitialUpdates } from './services/updateService';
import { seedInitialMetrics } from './services/metricService';
import { Investor, Update } from './types';
import { subscribeToUpdates } from './services/updateService';

/**
 * AuthenticatedApp Component
 * 
 * The main layout engine for authorized users. 
 * Manages side navigation, top-level page state, and shared real-time updates.
 */
function AuthenticatedApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<any>(null);
  const [updates, setUpdates] = useState<Update[]>([]);

  /**
   * Universal Navigation Handler
   * Allows components to trigger route changes with optional state parameters.
   */
  const navigateTo = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params);
  };

  useEffect(() => {
    const seedData = async () => {
      try {
        await Promise.all([
          seedInitialInvestors(),
          seedInitialUpdates(),
          seedInitialMetrics()
        ]);
      } catch (err) {
        console.error('Data seeding failed:', err);
      }
    };
    seedData();

    // Global subscription for updates so all pages share the same data
    const unsubUpdates = subscribeToUpdates(setUpdates);
    return () => unsubUpdates();
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardContent updates={updates} onNavigate={navigateTo} />;
      case 'investors': return <InvestorsPage params={pageParams} onParamsHandled={() => setPageParams(null)} />;
      case 'portfolio': return <PortfolioPage />;
      case 'reports': return <ReportsPage updates={updates} params={pageParams} onParamsHandled={() => setPageParams(null)} />;
      case 'settings': return <SettingsPage />;
      case 'notifications': return <NotificationsPage />;
      default: return <DashboardContent updates={updates} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-x-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentPage={currentPage}
        onPageChange={navigateTo}
      />

      <main className="flex-1 w-full lg:ml-64 p-0 min-w-0">
        <TopNav 
          onMenuClick={() => setIsSidebarOpen(true)} 
          onPageChange={navigateTo}
        />
        
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden bg-[#f8fafc]">
          <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-20 scroll-smooth">
            <div className="max-w-[1600px] mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeInOut" }}
                  className="w-full"
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

