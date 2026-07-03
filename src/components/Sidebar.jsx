import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Library, MessageCircleQuestion, Settings, LogOut, Sparkles,
  Users, Gamepad2, Layers, Bell, BarChart3, HeartHandshake, Filter, UserMinus,
  SplitSquareHorizontal, ChevronDown, ChevronRight, TrendingUp, Brain, LayoutGrid,
  ShieldAlert, MessageSquareMore, GitBranch, Lightbulb
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isGrowthOpen, setIsGrowthOpen] = useState(false);
  const [isIntelOpen, setIsIntelOpen] = useState(false);

  const coreItems = [
    { name: 'Overview',        path: '/',               icon: LayoutDashboard },
    { name: 'Users',           path: '/users',          icon: Users },
    { name: 'Games',           path: '/games',          icon: Gamepad2 },
    { name: 'Categories',      path: '/categories',     icon: FolderTree },
    { name: 'Card Catalog',    path: '/cards',          icon: Library },
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
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`
          }
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="truncate">{item.name}</span>
        </NavLink>
      );
    });

  const SectionHeader = ({ label, color, icon: Icon, isOpen, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-2 px-3 py-2 hover:bg-slate-800/50 rounded-lg transition-colors ${color}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
    </button>
  );

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 text-slate-200">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wide text-white">EleVora Panel</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">

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
            isOpen={isGrowthOpen}
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
            isOpen={isIntelOpen}
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
      <div className="p-3 border-t border-slate-800/50 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@elevora.com'}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-200 font-medium text-sm">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
