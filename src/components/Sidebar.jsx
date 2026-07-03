import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderTree, Library, MessageCircleQuestion, Settings, LogOut, Sparkles, Users, Gamepad2, Layers, Bell, BarChart3, HeartHandshake, Filter, UserMinus, SplitSquareHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const coreItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Users',       path: '/users',      icon: Users },
    { name: 'Games',       path: '/games',      icon: Gamepad2 },
    { name: 'Categories', path: '/categories', icon: FolderTree },
    { name: 'Card Catalog', path: '/cards', icon: Library },
    { name: 'Questions',    path: '/questions',    icon: MessageCircleQuestion },
    { name: 'Master Deck',  path: '/master-deck',  icon: Layers },
    { name: 'Notifications',path: '/notifications',icon: Bell },
  ];

  const growthItems = [
    { name: 'Card Analytics',path: '/card-analytics',icon: BarChart3 },
    { name: 'Dynamics',       path: '/relationship-dynamics',icon: HeartHandshake },
    { name: 'Funnel Tracking', path: '/funnel-tracking', icon: Filter },
    { name: 'Drop-off Analysis', path: '/dropoff-analysis', icon: UserMinus },
    { name: 'A/B Testing', path: '/ab-testing', icon: SplitSquareHorizontal },
  ];

  const renderNav = (items) => (
    items.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
              isActive
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`
          }
        >
          <Icon className="w-5 h-5" />
          {item.name}
        </NavLink>
      );
    })
  );

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 text-slate-200">
      <div className="h-20 flex items-center px-8 border-b border-slate-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">EleVora Panel</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">
        
        {/* Main Menu */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-4">
            Main Menu
          </div>
          <div className="space-y-1.5">
            {renderNav(coreItems)}
          </div>
        </div>

        {/* Growth & Optimization */}
        <div>
          <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3 px-4 flex items-center gap-2">
            Growth & Optimization
          </div>
          <div className="space-y-1.5">
            {renderNav(growthItems)}
          </div>
        </div>

        {/* Settings */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-4">
            System
          </div>
          <div className="space-y-1.5">
            {renderNav([{ name: 'Settings', path: '/settings', icon: Settings }])}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800/50 shrink-0">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@elevora.com'}</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-200 font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
