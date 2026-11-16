import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Library, MessageCircleQuestion, Settings, LogOut,
  Users, Gamepad2, Layers, Bell, BarChart3, HeartHandshake, Filter, UserMinus,
  SplitSquareHorizontal, ChevronDown, ChevronRight, TrendingUp, Brain, LayoutGrid,
  ShieldAlert, MessageSquareMore, GitBranch, Lightbulb, PackageOpen, CreditCard, X, Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const [isGrowthOpen, setIsGrowthOpen] = useState(false);
  const [isIntelOpen, setIsIntelOpen] = useState(false);

  const coreItems = [
    { name: 'Overview',        path: '/',               icon: LayoutDashboard },
    { name: 'Couples & Rooms', path: '/games',          icon: Gamepad2 },
    { name: 'Users',           path: '/users',          icon: Users },
    { name: 'Categories',      path: '/categories',     icon: FolderTree },
    { name: 'Card Catalog',    path: '/cards',          icon: Library },
    { name: 'Bundles',         path: '/bundles',        icon: PackageOpen },
    { name: 'Purchases (₹)',   path: '/purchases',      icon: CreditCard },
    { name: 'Questions',       path: '/questions',      icon: MessageCircleQuestion },
    { name: 'Master Deck',     path: '/master-deck',    icon: Layers },
    { name: 'Notifications',   path: '/notifications',  icon: Bell },
  ];

  const growthItems = [
    { name: 'Soft Launch',       path: '/soft-launch',           icon: Compass },
    { name: 'Card Analytics',    path: '/card-analytics',        icon: BarChart3 },
    { name: 'Dynamics',          path: '/relationship-dynamics', icon: HeartHandshake },
    { name: 'Funnel Tracking',   path: '/funnel-tracking',       icon: Filter },
    { name: 'Drop-off Analysis', path: '/dropoff-analysis',      icon: UserMinus },
    { name: 'A/B Testing',       path: '/ab-testing',            icon: SplitSquareHorizontal },
  ];

  const intelligenceItems = [
    { name: 'Insight Dashboard',    path: '/intelligence/insights',           icon: Lightbulb },
    { name: 'Behavioral Scoring',   path: '/intelligence/behavioral-scoring', icon: Brain },
    { name: 'Smart Deck Engine',    path: '/intelligence/smart-deck',         icon: LayoutGrid },
    { name: 'Risk Detection',       path: '/intelligence/risk-detection',     icon: ShieldAlert },
    { name: 'Feedback System',      path: '/intelligence/feedback',           icon: MessageSquareMore },
    { name: 'Content Versioning',   path: '/intelligence/content-versioning', icon: GitBranch },
    { name: 'Business KPIs',        path: '/intelligence/kpis',               icon: TrendingUp },
  ];

  const renderNav = (items) =>
    items.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/'}
          onClick={() => setIsOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 font-medium text-xs ${
              isActive
                ? 'bg-[#256df2]/15 text-[#38bdf8] border border-[#256df2]/30 shadow-[0_0_15px_rgba(37,109,242,0.2)] font-semibold'
                : 'text-slate-400 hover:bg-white/[0.04] hover:text-white hover:translate-x-0.5'
            }`
          }
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{item.name}</span>
        </NavLink>
      );
    });

  const SectionHeader = ({ label, color, icon: Icon, isOpenSection, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1.5 px-3 py-2 hover:bg-white/[0.03] rounded-xl transition-colors ${color}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      {isOpenSection ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
    </button>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#0b0c12]/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`w-64 bg-[#12131d]/95 md:bg-[#12131d]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col h-screen shrink-0 text-slate-200 z-50 fixed md:relative transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo */}
        <div className="h-16 md:h-20 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#256df2] via-[#6366f1] to-[#d62380] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 relative overflow-hidden group">
              <Layers className="w-4 h-4 text-white relative z-10" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white">SoulShuffle</span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium">Executive Admin</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg" aria-label="Close Sidebar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto custom-scrollbar">

          {/* Main Menu */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-3">Core Operations</div>
            <div className="space-y-0.5">{renderNav(coreItems)}</div>
          </div>

          {/* Growth & Optimization Dropdown */}
          <div>
            <SectionHeader
              label="Growth & Cohorts"
              color="text-emerald-400"
              icon={TrendingUp}
              isOpenSection={isGrowthOpen}
              onToggle={() => setIsGrowthOpen(o => !o)}
            />
            <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out ${isGrowthOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              {renderNav(growthItems)}
            </div>
          </div>

          {/* Advanced / Future Intelligence Dropdown */}
          <div>
            <SectionHeader
              label="Content Intelligence"
              color="text-blue-400"
              icon={Brain}
              isOpenSection={isIntelOpen}
              onToggle={() => setIsIntelOpen(o => !o)}
            />
            <div className={`space-y-0.5 overflow-hidden transition-all duration-300 ease-in-out ${isIntelOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {renderNav(intelligenceItems)}
            </div>
          </div>

          {/* System & Security */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-3">System & Outage</div>
            <div className="space-y-0.5">
              {renderNav([
                { name: 'Action Logs', path: '/audit-logs', icon: ShieldAlert },
                { name: 'Settings',    path: '/settings',   icon: Settings },
              ])}
            </div>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-3.5 border-t border-white/5 shrink-0 bg-[#0d0e16]/60">
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-xl bg-[#181926] border border-white/5 group hover:border-blue-500/30 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-[#256df2] to-[#d62380] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</p>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-[#38bdf8] border border-blue-500/30">
                  {user?.role || 'Admin'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@elevora.com'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-200 font-semibold text-xs border border-transparent hover:border-rose-500/20">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
