import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Loader2, DollarSign, TrendingUp, Filter, 
  Search, ExternalLink, AlertCircle, CheckCircle2, RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axiosInstance';

export default function PurchasesDashboard() {
  const [stats, setStats] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch Stats
      const statsRes = await api.get('/admin/purchases/stats');
      setStats(statsRes.data.data.stats);

      // Fetch Purchases
      const pRes = await api.get(`/admin/purchases?page=${page}&limit=20&search=${search}`);
      setPurchases(pRes.data.data.purchases);
    } catch (error) {
      toast.error('Failed to load purchase data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleRefund = async (id) => {
    const reason = prompt('Enter refund reason (Optional):');
    if (reason === null) return; // User cancelled

    try {
      await api.post(`/admin/purchases/${id}/refund`, { reason });
      toast.success('Refund processed successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-emerald-400" />
          Revenue & Purchases
        </h1>
        <p className="text-slate-400 mt-1">Track store revenue, recent transactions, and process refunds.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Revenue (INR)</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-1 flex items-center">
                <span className="text-emerald-500 mr-1 text-2xl">₹</span>
                {stats?.total_revenue || '0.00'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Transactions</p>
              <h3 className="text-3xl font-bold text-slate-100 mt-1">
                {stats?.total_transactions || 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Refunded Total</p>
              <h3 className="text-3xl font-bold text-rose-100 mt-1 flex items-center">
                <span className="text-rose-500 mr-1 text-2xl">₹</span>
                {stats?.total_refunded || '0.00'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Top Platform</p>
              <h3 className="text-2xl font-bold text-slate-100 mt-2 uppercase">
                {stats?.by_platform?.[0]?.platform || 'NONE'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Filter className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-100">Recent Transactions</h2>
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user ID or receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-indigo-500 focus:outline-none w-64"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">User ID</th>
                <th className="p-4 font-semibold">Bundle Plan</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Platform</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/50">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-slate-300">
                      {new Date(p.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400 truncate max-w-[120px]">
                      {p.user_id}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{p.bundle_plans?.name || 'Unknown Plan'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{p.bundle_plans?.bundles?.name || 'Unknown Bundle'}</div>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      ${p.amount}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded text-xs uppercase tracking-wider font-medium">
                        {p.platform}
                      </span>
                    </td>
                    <td className="p-4">
                      {p.status === 'COMPLETED' ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2.5 py-1 rounded-full w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                        </span>
                      ) : p.status === 'REFUNDED' ? (
                        <span className="flex items-center gap-1.5 text-rose-400 text-xs font-medium bg-rose-400/10 px-2.5 py-1 rounded-full w-fit">
                          <RotateCcw className="w-3.5 h-3.5" /> REFUNDED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium bg-amber-400/10 px-2.5 py-1 rounded-full w-fit">
                          <AlertCircle className="w-3.5 h-3.5" /> {p.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {p.status === 'COMPLETED' && (
                        <button 
                          onClick={() => handleRefund(p.id)}
                          className="text-xs font-medium text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-3 py-1.5 rounded transition-colors"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-800/30">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded disabled:opacity-50 text-sm font-medium"
          >
            Previous
          </button>
          <span className="text-slate-400 text-sm">Page {page}</span>
          <button 
            disabled={purchases.length < 20}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded disabled:opacity-50 text-sm font-medium"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
