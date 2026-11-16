import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { 
  Users, Activity, UserPlus, Gamepad2, CheckCircle2, Layers, 
  Sparkles, TrendingUp, ArrowUpRight, Zap, ArrowRight, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Overview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    newUsersToday: 0,
    dau: 0,
    completedGames: 0,
    avgCardsPlayed: 0,
    avgPenalties: 0
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      if (response.data?.status === 'success') {
        setStats(response.data.data.stats || {});
      }
    } catch (error) {
      console.warn('Dashboard stats fallback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full min-h-[60vh] flex items-center justify-center">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-[#256df2]/20"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#256df2]"></div>
        </div>
      </div>
    );
  }

  const activeSessionsCount = stats.activeSessions ?? 0;
  const totalUsersCount = stats.totalUsers ?? 0;
  const completedGamesCount = stats.completedGames ?? 0;
  const waitingRoomsCount = stats.waitingRooms ?? 0;
  const stalledRoomsCount = stats.stalledRooms ?? 0;
  const grossRevenue = stats.grossRevenue ?? 0;
  const todayRevenue = stats.todayRevenue ?? 0;
  const activeSubscriptions = stats.activeSubscriptions ?? 0;
  const freePoolCards = stats.freePoolCards ?? 40;
  const avgCardsPlayed = stats.avgCardsPlayed ?? 0;
  const totalGamesCount = stats.totalGames ?? 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* Top Greeting & Live Status Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#256df2] animate-pulse"></span>
            <span className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider">SoulShuffle Live Operations</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Active Pill */}
            <div className="px-3.5 py-1.5 rounded-full bg-[#256df2]/20 border border-[#256df2]/40 text-[#38bdf8] text-xs font-semibold flex items-center space-x-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse"></span>
              <span>{activeSessionsCount} Live Active {activeSessionsCount === 1 ? 'Room' : 'Rooms'}</span>
            </div>
            {/* Waiting Pill */}
            <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center space-x-1.5">
              <span>{waitingRoomsCount} Waiting for Partner</span>
            </div>
            {/* Completed Pill */}
            <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
              <span>{completedGamesCount} Completed</span>
            </div>
            {/* Subscriptions Pill */}
            <div className="hatched-pill px-3.5 py-1.5 rounded-full text-slate-300 text-xs font-medium">
              <span>{activeSubscriptions} Active Subscriptions</span>
            </div>
          </div>
        </div>

        {/* Highlight KPI Summary Badges */}
        <div className="flex items-center gap-6 self-start lg:self-auto">
          {/* KPI 1 */}
          <div className="text-right">
            <div className="flex items-center justify-end space-x-1.5">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                LIVE
              </span>
              <span className="text-2xl md:text-3xl font-black text-white">{activeSessionsCount.toLocaleString()}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Couples</div>
          </div>

          <div className="h-10 w-px bg-white/10"></div>

          {/* KPI 2 */}
          <div className="text-right">
            <div className="flex items-center justify-end space-x-1.5">
              <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-[11px] font-bold text-[#38bdf8]">
                REVENUECAT
              </span>
              <span className="text-2xl md:text-3xl font-black text-white">₹{grossRevenue.toLocaleString()}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gross (INR)</div>
          </div>

          <div className="h-10 w-px bg-white/10"></div>

          {/* KPI 3 */}
          <div className="text-right">
            <div className="flex items-center justify-end space-x-1.5">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-400">
                &gt;48H
              </span>
              <span className="text-2xl md:text-3xl font-black text-white">{stalledRoomsCount}</span>
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Stalled Rooms</div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Executive Dashboard Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Column 1: Game Sessions Summary (3 Cols) */}
        <div className="lg:col-span-3 card-surface rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white tracking-wide">Game Sessions Summary</h3>
              <span className="text-[11px] font-medium text-slate-400">Live IST</span>
            </div>

            <div className="space-y-2.5">
              {/* Item 1: Royal Blue */}
              <div 
                onClick={() => navigate('/games')}
                className="bg-[#1e1f2b] hover:bg-[#252737] transition-colors rounded-xl px-4 py-3 flex items-center justify-between border border-white/5 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#256df2] shadow-sm shadow-blue-500"></span>
                  <span className="text-xs font-semibold text-slate-200">Active Turns</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#2d2e3f] text-slate-200">{activeSessionsCount}</span>
              </div>

              {/* Item 2: Emerald Green */}
              <div 
                onClick={() => navigate('/games')}
                className="bg-[#1e1f2b] hover:bg-[#252737] transition-colors rounded-xl px-4 py-3 flex items-center justify-between border border-white/5 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-sm shadow-amber-500"></span>
                  <span className="text-xs font-semibold text-slate-200">Waiting for Partner</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#2d2e3f] text-slate-200">{waitingRoomsCount}</span>
              </div>

              {/* Item 3: Hot Pink */}
              <div 
                onClick={() => navigate('/games')}
                className="bg-[#1e1f2b] hover:bg-[#252737] transition-colors rounded-xl px-4 py-3 flex items-center justify-between border border-white/5 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d62380] shadow-sm shadow-pink-500"></span>
                  <span className="text-xs font-semibold text-slate-200">Completed</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#2d2e3f] text-slate-200">{completedGamesCount.toLocaleString()}</span>
              </div>

              {/* Item 4: Amber Stalled */}
              <div 
                onClick={() => navigate('/games')}
                className="bg-[#1e1f2b] hover:bg-[#252737] transition-colors rounded-xl px-4 py-3 flex items-center justify-between border border-white/5 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-sm shadow-red-500"></span>
                  <span className="text-xs font-semibold text-slate-200">Stalled (&gt;48h)</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#2d2e3f] text-slate-200">{stalledRoomsCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-start space-x-2">
            <Zap className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-slate-400 leading-tight">Turn timers active. Automatic pause protection enabled for scheduled outages.</p>
          </div>
        </div>

        {/* Column 2: Incident & Activity Frequency Chart (6 Cols) */}
        <div className="lg:col-span-6 card-surface rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden shadow-xl">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Real-Time Couple Activity</h3>
              <p className="text-[11px] text-slate-400">Comparing Free Pool Turns (Pink) vs Paid Full Deck (Cyan)</p>
            </div>
            
            {/* Time Toggle Pills */}
            <div className="capsule-nav-container rounded-full p-1 flex items-center space-x-1 text-[11px]">
              <button 
                onClick={() => setTimeFilter('12m')}
                className={`px-3 py-1 rounded-full transition-all ${timeFilter === '12m' ? 'capsule-nav-active font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                12 months
              </button>
              <button 
                onClick={() => setTimeFilter('30d')}
                className={`px-3 py-1 rounded-full transition-all ${timeFilter === '30d' ? 'capsule-nav-active font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                30 days
              </button>
              <button 
                onClick={() => setTimeFilter('7d')}
                className={`px-3 py-1 rounded-full transition-all ${timeFilter === '7d' ? 'capsule-nav-active font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                1 week
              </button>
            </div>
          </div>

          {/* Dual-Curve SVG Chart with Glow & Floating Tooltip */}
          <div className="relative h-48 w-full mt-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-600">
              <div className="border-b border-white/5 pb-0.5">400</div>
              <div className="border-b border-white/5 pb-0.5">300</div>
              <div className="border-b border-white/5 pb-0.5">200</div>
              <div className="border-b border-white/5 pb-0.5">100</div>
              <div>0</div>
            </div>

            <svg className="w-full h-full overflow-visible relative z-10" viewBox="0 0 600 180" preserveAspectRatio="none">
              <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.03)" strokeDasharray="4" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.03)" strokeDasharray="4" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="rgba(255,255,255,0.03)" strokeDasharray="4" />

              {/* Cyan Curve: Paid Full Deck Turns */}
              <path className="chart-path-cyan" fill="none" strokeWidth="2.5" d="M 0,60 C 50,55 90,140 150,130 C 210,120 230,80 290,120 C 350,160 410,120 470,80 C 530,40 570,120 600,70" />
              
              {/* Hot Pink Curve: Free-Pool Cards */}
              <path className="chart-path-pink" fill="none" strokeWidth="2.5" d="M 0,145 C 50,150 90,130 150,110 C 200,90 230,60 270,70 C 310,80 340,160 380,125 C 430,90 490,140 550,110 C 580,95 590,90 600,85" />

              {/* Active Tooltip Pinpoint at x=290, y=120 */}
              <circle cx="290" cy="120" r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" className="animate-pulse" />
              <circle cx="290" cy="120" r="12" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6" />
            </svg>

            {/* Floating Translucent Glass Tooltip */}
            <div className="tooltip-bubble absolute left-[48%] top-[28%] -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-xl text-center pointer-events-none z-20">
              <div className="text-[10px] text-slate-300 font-medium">Live Telemetry</div>
              <div className="text-xs font-bold text-white flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span> {stats.totalCardsPlayed || 191} Dares Dispatched
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
            <span>24 Aug</span>
            <span>31 Aug</span>
            <span className="text-white font-semibold">7 Sept</span>
            <span>14 Sept</span>
            <span>21 Sept</span>
            <span>28 Sept</span>
          </div>
        </div>

        {/* Column 3: Smart Deck AI Engine Hero (3 Cols) */}
        <div className="lg:col-span-3 electric-blue-card rounded-2xl p-5 flex flex-col justify-between text-white relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-extrabold tracking-tight">Smart Deck AI Engine</h3>
              <button 
                onClick={() => navigate('/intelligence/smart-deck')}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center cursor-pointer"
                title="Go to Smart Deck"
              >
                <ArrowUpRight className="w-4 h-4 text-white" />
              </button>
            </div>

            <p className="text-xs text-blue-100 font-medium leading-relaxed mb-6">
              Dynamic 80/20 novel-to-repeat ratio with strict 40-card balanced free-pool guard.
            </p>

            {/* Floating Frosted White Stacked Pills */}
            <div className="space-y-3">
              <div className="frosted-pill rounded-xl px-4 py-3 flex items-center justify-between text-slate-900 shadow-md">
                <span className="text-xs font-bold tracking-tight">Target Ratio:</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-900 text-white">80% Novel / 20% Repeat</span>
              </div>

              <div className="frosted-pill-translucent rounded-xl px-4 py-3 flex items-center justify-between text-white shadow-sm">
                <span className="text-xs font-semibold">Pool Depth:</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white/30 text-white">8 Categories Balanced</span>
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-xs text-blue-100 font-semibold border-t border-white/15">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span> Live Shuffler
            </span>
            <button 
              onClick={() => navigate('/intelligence/smart-deck')}
              className="underline cursor-pointer hover:text-white"
            >
              Audit Pool →
            </button>
          </div>
        </div>

      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card-surface rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
            <h4 className="text-2xl font-black text-white mt-1">{totalUsersCount.toLocaleString()}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#38bdf8]">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Subscriptions</p>
            <h4 className="text-2xl font-black text-white mt-1">{activeSubscriptions.toLocaleString()}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Cards / Couple</p>
            <h4 className="text-2xl font-black text-white mt-1">{avgCardsPlayed}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="card-surface rounded-2xl p-5 border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Games</p>
            <h4 className="text-2xl font-black text-white mt-1">{totalGamesCount.toLocaleString()}</h4>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

    </div>
  );
}
