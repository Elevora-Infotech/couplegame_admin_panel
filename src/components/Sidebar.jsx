import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Library, MessageCircleQuestion, Settings, LogOut, Sparkles,
  Users, Gamepad2, Layers, Bell, BarChart3, HeartHandshake, Filter, UserMinus,
  SplitSquareHorizontal, ChevronDown, ChevronRight, TrendingUp, Brain, LayoutGrid,
  ShieldAlert, MessageSquareMore, GitBranch, Lightbulb, PackageOpen, CreditCard, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const [isGrowthOpen, setIsGrowthOpen] = useState(false);
  const [isIntelOpen, setIsIntelOpen] = useState(false);

  const coreItems = [
    { name: 'Overview',        path: '/',               icon: LayoutDashboard },
    { name: 'Users',           path: '/users',          icon: Users },
    { name: 'Games',           path: '/games',          icon: Gamepad2 },
    { name: 'Categories',      path: '/categories',     icon: FolderTree },
    { name: 'Card Catalog',    path: '/cards',          icon: Library },
    { name: 'Bundles',         path: '/bundles',        icon: PackageOpen },
    { name: 'Purchases',       path: '/purchases',      icon: CreditCard },
    { name: 'Questions',       path: '/questions',      icon: MessageCircleQuestion },
    { name: 'Master Deck',     path: '/master-deck',    icon: Layers },
    { name: 'Notifications',   path: '/notifications',  icon: Bell },
  ];

  const growthItems = [
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
            `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm ${
              isActive
                ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
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
      className={`w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 px-3 py-2 hover:bg-slate-800/50 rounded-lg transition-colors ${color}`}
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
          className="fixed inset-0 bg-[#030712]/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`w-72 bg-[#030712]/90 md:bg-[#030712]/60 backdrop-blur-2xl border-r border-white/5 flex flex-col h-screen shrink-0 text-slate-200 z-50 fixed md:relative transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Sparkles className="w-5 h-5 text-white relative z-10 animate-pulse" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">EleVora</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto custom-scrollbar">

          {/* Main Menu */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">Main Menu</div>
            <div className="space-y-1">{renderNav(coreItems)}</div>
          </div>

          {/* Growth & Optimization Dropdown */}
          <div>
            <SectionHeader
              label="Growth & Optimization"
              color="text-emerald-500"
              icon={TrendingUp}
              isOpenSection={isGrowthOpen}
              onToggle={() => setIsGrowthOpen(o => !o)}
            />
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isGrowthOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              {renderNav(growthItems)}
            </div>
          </div>

          {/* Advanced / Future Intelligence Dropdown */}
          <div>
            <SectionHeader
              label="Advanced Intelligence"
              color="text-violet-400"
              icon={Brain}
              isOpenSection={isIntelOpen}
              onToggle={() => setIsIntelOpen(o => !o)}
            />
            <div className={`space-y-1 overflow-hidden transition-all duration-300 ease-in-out ${isIntelOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              {renderNav(intelligenceItems)}
            </div>
          </div>

          {/* System */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-3">System</div>
            <div className="space-y-1">{renderNav([{ name: 'Settings', path: '/settings', icon: Settings }])}</div>
          </div>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-white/[0.02]">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-2xl glass-panel group hover:border-violet-500/30 transition-colors cursor-pointer">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-violet-500/20 shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-violet-300/70 truncate">{user?.email || 'admin@elevora.com'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-300 font-semibold text-sm border border-transparent hover:border-rose-500/20 shadow-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
