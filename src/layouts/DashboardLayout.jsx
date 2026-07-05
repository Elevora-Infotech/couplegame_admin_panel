import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#030712] text-slate-200 relative">
      {/* Global Background Blobs for the layout */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 w-full">
        <header className="h-16 md:h-20 shrink-0 flex items-center justify-between md:justify-end px-4 md:px-8 border-b border-white/5 bg-[#030712]/40 backdrop-blur-xl z-20 sticky top-0">
          
          {/* Mobile Hamburger Menu */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-white/5 rounded-xl border border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full shadow-lg shadow-emerald-500/5 transition-all hover:shadow-emerald-500/10">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span className="text-[10px] md:text-xs font-bold tracking-wider text-emerald-400 uppercase">AWS Live</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
