import React from 'react';
import { GlassCard } from '../ui/GlassCard';
import { BarChart3, TrendingUp, PieChart, ExternalLink, ArrowUpRight } from 'lucide-react';

const COMPANIES = [
  { name: 'Linear', round: 'Series B', valuation: '$1.2B', growth: '+12%', color: 'bg-slate-900' },
  { name: 'Vercel', round: 'Series D', valuation: '$2.5B', growth: '+45%', color: 'bg-slate-800' },
  { name: 'Figma', round: 'Acquired', valuation: '$20B', growth: '-', color: 'bg-rose-500' },
  { name: 'Supabase', round: 'Series A', valuation: '$120M', growth: '+80%', color: 'bg-emerald-500' },
];

export const PortfolioPage: React.FC = () => {
  const handleExport = () => {
    const headers = ['Name', 'Round', 'Valuation', 'Growth'];
    const rows = COMPANIES.map(c => [
      c.name, 
      c.round, 
      c.valuation.replace('$', '').replace('B', ' Billion').replace('M', ' Million'), 
      c.growth
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `portfolio_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Portfolio Analytics</h1>
          <p className="text-slate-500 font-medium">Track your allocation, cap table, and round history across the portfolio.</p>
        </div>
        <button 
          onClick={handleExport}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95"
        >
          <ArrowUpRight size={18} /> Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl mb-3">
            <PieChart size={24} />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">12</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Stakes</p>
        </GlassCard>
        
        <GlassCard className="flex flex-col items-center justify-center p-8 text-center">
          <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl mb-3">
            <TrendingUp size={24} />
          </div>
          <h4 className="text-2xl font-bold text-slate-800 tracking-tight mb-1">$42.5M</h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Value</p>
        </GlassCard>

        <GlassCard className="md:col-span-2 flex flex-col items-start justify-center p-8">
          <div className="flex items-center gap-4 w-full">
            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-800 mb-2">Portfolio Diversification</h3>
              <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                <div className="h-full bg-accent w-[45%]" />
                <div className="h-full bg-indigo-400 w-[25%]" />
                <div className="h-full bg-emerald-400 w-[20%]" />
                <div className="h-full bg-amber-400 w-[10%]" />
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-accent" /> SaaS
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" /> FinTech
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" /> AI
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Portfolio Companies</h3>
          <div className="grid grid-cols-1 gap-3">
            {COMPANIES.map((company) => (
              <GlassCard key={company.name} className="group hover:border-accent transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${company.color} rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg`}>
                      {company.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{company.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{company.round}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-sm">{company.valuation}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">{company.growth}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">Recent Funding History</h3>
          <div className="space-y-3">
            {[
              { type: 'Series A', date: 'Jan 2023', text: 'Led by Benchmark', amount: '$12.0M', post: '$45M' },
              { type: 'Seed Round', date: 'Aug 2021', text: 'Led by First Round', amount: '$2.5M', post: '$10M' },
            ].map((round) => (
              <GlassCard key={round.type}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-800 font-bold text-xs tracking-tighter">
                      {round.type[0]}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{round.type}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{round.date} • {round.text}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-sm">{round.amount}</p>
                    <p className="text-[10px] text-emerald-600 font-bold">{round.post} Post-money</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
