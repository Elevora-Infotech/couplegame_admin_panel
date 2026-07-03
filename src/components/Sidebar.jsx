import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderTree, Library, MessageCircleQuestion, Settings, LogOut, Sparkles, Users, Gamepad2, Layers, Bell, BarChart3, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Users',       path: '/users',      icon: Users },
    { name: 'Games',       path: '/games',      icon: Gamepad2 },
    { name: 'Categories', path: '/categories', icon: FolderTree },
    { name: 'Card Catalog', path: '/cards', icon: Library },
    { name: 'Card Analytics',path: '/card-analytics',icon: BarChart3 },
    { name: 'Dynamics',       path: '/relationship-dynamics',icon: HeartHandshake },
    { name: 'Questions',    path: '/questions',    icon: MessageCircleQuestion },
    { name: 'Master Deck',  path: '/master-deck',  icon: Layers },
    { name: 'Notifications',path: '/notifications',icon: Bell },
    { name: 'Settings',     path: '/settings',     icon: Settings },
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 text-slate-200">
      <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wide text-white">EleVora Panel</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">
          Main Menu
        </div>
        {navItems.map((item) => {
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
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-slate-800/50">
          <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{user?.role?.replace('_', ' ') || 'Super Admin'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
