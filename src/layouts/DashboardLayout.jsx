import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import UnifiedSearchBar from '../components/UnifiedSearchBar';
import AppWideControlsBar from '../components/AppWideControlsBar';
import { Menu, Bell, Sparkles, Layers, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navCapsules = [
    { name: 'Overview', path: '/' },
    { name: 'Couples & Rooms', path: '/games' },
    { name: 'Users', path: '/users' },
    { name: 'Subscriptions (₹)', path: '/purchases' },
    { name: 'Smart Deck (80/20)', path: '/intelligence/smart-deck' },
    { name: 'Soft-Launch', path: '/soft-launch' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden relative transition-colors duration-200 ${
      isDark ? 'bg-[#0b0c12] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Ambient Aurora Glow */}
      <div className={`ambient-aurora ${isDark ? '' : 'opacity-20'}`}></div>

      {/* Global Background Depth Flares */}
      <div className={`absolute top-[-8%] right-[-5%] w-[45%] h-[45%] bg-[#256df2]/10 blur-[130px] rounded-full pointer-events-none z-0 ${isDark ? '' : 'opacity-40'}`}></div>
      <div className={`absolute bottom-[-10%] left-[15%] w-[45%] h-[45%] bg-[#d62380]/10 blur-[130px] rounded-full pointer-events-none z-0 ${isDark ? '' : 'opacity-40'}`}></div>
      
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full">
        
        {/* Floating Top Header */}
        <header className={`h-16 md:h-20 shrink-0 flex items-center justify-between px-4 md:px-8 border-b backdrop-blur-2xl z-20 sticky top-0 gap-3 transition-colors ${
          isDark ? 'border-white/5 bg-[#13141f]/70' : 'border-slate-200/90 bg-white/85 shadow-xs'
        }`}>
          
          {/* Left: Mobile Hamburger & Context Breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-xl border shrink-0 transition-colors ${
                isDark ? 'text-slate-300 hover:text-white bg-white/5 border-white/10' : 'text-slate-700 hover:text-slate-900 bg-slate-100 border-slate-200'
              }`}
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile-only logo (sidebar is hidden on mobile) */}
            <div className="flex md:hidden items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#256df2] via-[#6366f1] to-[#d62380] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className={`text-sm font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>SoulShuffle</span>
            </div>

            {/* Desktop Quick Indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Management Console</span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>/</span>
              <span className="text-blue-500 font-medium">Live System</span>
            </div>
          </div>

          {/* Center: Top Capsule Pill Navigation (Large Screens) */}
          <nav className="hidden 2xl:flex capsule-nav-container rounded-full p-1 items-center space-x-1 shadow-inner shrink-0">
            {navCapsules.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-xs transition-all ${
                    isActive
                      ? 'capsule-nav-active font-semibold'
                      : isDark
                        ? 'text-slate-400 hover:text-white font-medium'
                        : 'text-slate-600 hover:text-slate-950 font-medium'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Unified Global Search (7 Identifiers) */}
          <div className="flex-1 max-w-md mx-2">
            <UnifiedSearchBar />
          </div>

          {/* Right Controls, Notifications & Profile Avatar */}
          <div className="flex items-center gap-2.5 shrink-0">
            <AppWideControlsBar />

            {/* Theme Toggle Button (Dark / Light) */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-amber-300 border-white/10 shadow-inner'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300/80 shadow-xs'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme Mode"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px] font-bold text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline text-[11px] font-bold text-slate-700">Dark</span>
                </>
              )}
            </button>
            
            {/* Live Indicator */}
            <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-inner ${
              isDark ? 'bg-[#181924] border-white/5' : 'bg-emerald-50 border-emerald-200/80 shadow-xs'
            }`}>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </span>
              <span className={`text-[10px] font-bold tracking-wider uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Live</span>
            </div>

            {/* Profile Avatar Pill */}
            <div className={`flex items-center gap-2 pl-2 border-l ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="w-8 h-8 rounded-full ring-2 ring-[#256df2]/60 bg-gradient-to-tr from-[#256df2] to-[#d62380] flex items-center justify-center text-xs font-bold text-white shadow-md">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden xl:block text-left leading-tight">
                <div className={`text-xs font-bold truncate max-w-[90px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Admin'}</div>
                <div className={`text-[10px] font-medium capitalize ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{user?.role || 'Super Admin'}</div>
              </div>
            </div>
          </div>

        </header>

        {/* Content Outlet */}
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
