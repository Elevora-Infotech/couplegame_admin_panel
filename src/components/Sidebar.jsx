import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FolderTree, Library, MessageCircleQuestion, Settings, LogOut,
  Users, Gamepad2, Layers, Bell, BarChart3, HeartHandshake, Filter, UserMinus,
  SplitSquareHorizontal, ChevronDown, ChevronRight, TrendingUp, Brain, LayoutGrid,
  ShieldAlert, MessageSquareMore, GitBranch, Lightbulb, PackageOpen, CreditCard, X, Compass, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
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
    { name: 'Team & Admins',    path: '/team',           icon: ShieldCheck },
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
                ? isDark
                  ? 'bg-[#256df2]/15 text-[#38bdf8] border border-[#256df2]/30 shadow-[0_0_15px_rgba(37,109,242,0.2)] font-semibold'
                  : 'bg-blue-50 text-blue-600 border border-blue-200/80 shadow-xs font-semibold'
                : isDark
                  ? 'text-slate-400 hover:bg-white/[0.04] hover:text-white hover:translate-x-0.5'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-0.5'
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
      className={`w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
        isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-100'
      } ${color}`}
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
          className={`fixed inset-0 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200 ${
            isDark ? 'bg-[#0b0c12]/80' : 'bg-slate-900/40'
          }`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`w-64 backdrop-blur-2xl border-r flex flex-col h-screen shrink-0 z-50 fixed md:relative transition-all duration-300 ease-in-out ${
        isDark 
          ? 'bg-[#12131d]/95 md:bg-[#12131d]/80 border-white/5 text-slate-200' 
          : 'bg-white/95 md:bg-white/90 border-slate-200 text-slate-800 shadow-xs'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Logo */}
        <div className={`h-16 md:h-20 flex items-center justify-between px-5 border-b shrink-0 ${
          isDark ? 'border-white/5' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#256df2] via-[#6366f1] to-[#d62380] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 relative overflow-hidden group">
              <Layers className="w-4 h-4 text-white relative z-10" />
            </div>
            <div>
              <span className={`text-base font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>SoulShuffle</span>
              <span className={`text-[10px] block -mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Executive Admin</span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className={`md:hidden p-1.5 rounded-lg ${
            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`} aria-label="Close Sidebar">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto custom-scrollbar">

          {/* Main Menu */}
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 px-3 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>Core Operations</div>
            <div className="space-y-0.5">{renderNav(coreItems)}</div>
          </div>

          {/* Growth & Optimization Dropdown */}
          <div>
            <SectionHeader
              label="Growth & Cohorts"
              color={isDark ? "text-emerald-400" : "text-emerald-600"}
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
              color={isDark ? "text-blue-400" : "text-blue-600"}
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
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 px-3 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}>System & Outage</div>
            <div className="space-y-0.5">
              {renderNav([
                { name: 'Action Logs', path: '/audit-logs', icon: ShieldAlert },
                { name: 'Settings',    path: '/settings',   icon: Settings },
              ])}
            </div>
          </div>
        </nav>

        {/* User Footer */}
        <div className={`p-3.5 border-t shrink-0 ${
          isDark ? 'border-white/5 bg-[#0d0e16]/60' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className={`flex items-center gap-2.5 px-3 py-2.5 mb-2 rounded-xl border transition-colors ${
            isDark ? 'bg-[#181926] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 shadow-xs hover:border-blue-400'
          }`}>
            <div className="w-8 h-8 bg-gradient-to-br from-[#256df2] to-[#d62380] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Admin User'}</p>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-500/20 text-[#38bdf8] border border-blue-500/30">
                  {user?.role || 'Admin'}
                </span>
              </div>
              <p className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email || 'admin@elevora.com'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 rounded-xl transition-all duration-200 font-semibold text-xs border border-transparent hover:border-rose-500/20 cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
