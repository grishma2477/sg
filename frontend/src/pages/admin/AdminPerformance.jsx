import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import { RefreshCw, Trash2, Database, Zap } from 'lucide-react';

function StatBox({ label, value, mono }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-bold text-gray-900 ${mono ? 'font-mono text-sm' : ''}`}>{value ?? '–'}</p>
    </div>
  );
}

export default function AdminPerformance() {
  const [slowQueries, setSlowQueries] = useState(null);
  const [dbStats,     setDbStats]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [minMs,       setMinMs]       = useState(50);
  const [flushing,    setFlushing]    = useState(false);

  async function fetchAll() {
    setLoading(true);
    try {
      const [sq, db] = await Promise.all([
        apiRequest(`/api/admin/performance/slow-queries?min_ms=${minMs}&limit=20`),
        apiRequest('/api/admin/performance/db-stats'),
      ]);
      setSlowQueries(sq?.data ?? null);
      setDbStats(db?.data ?? null);
    } catch (e) {
      toast.error(e?.message || 'Failed to load performance data');
    }
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, [minMs]);

  async function flushCache(pattern = '*') {
    if (!window.confirm(`Flush cache pattern "${pattern}"?`)) return;
    setFlushing(true);
    try {
      await apiRequest('/api/admin/performance/cache-flush', {
        method: 'POST',
        body: JSON.stringify({ pattern }),
      });
      toast.success(`Cache flushed: ${pattern}`);
    } catch { toast.error('Flush failed'); }
    setFlushing(false);
  }

  const fmt = n => n == null ? '–' : Number(n).toLocaleString();

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Performance</h1>
          <p className="text-sm text-gray-400">Slow queries, DB stats, cache management</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* DB Stats */}
      {dbStats && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Database size={16} className="text-indigo-600" /> Database
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <StatBox label="DB Size"         value={dbStats.db_size} />
            <StatBox label="Total Connections" value={fmt(dbStats.connections?.total)} />
            <StatBox label="Active Connections" value={fmt(dbStats.connections?.active)} />
            <StatBox label="Tables"            value={fmt(dbStats.tables?.length)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-semibold">Table</th>
                  <th className="pb-2 font-semibold text-right">Size</th>
                  <th className="pb-2 font-semibold text-right">Live Rows</th>
                  <th className="pb-2 font-semibold text-right">Dead Rows</th>
                </tr>
              </thead>
              <tbody>
                {dbStats.tables?.map(t => (
                  <tr key={t.table_name} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs text-gray-700">{t.table_name}</td>
                    <td className="py-2 text-right text-gray-500">{t.total_size}</td>
                    <td className="py-2 text-right text-gray-500">{fmt(t.live_rows)}</td>
                    <td className={`py-2 text-right ${Number(t.dead_rows) > 1000 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                      {fmt(t.dead_rows)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cache */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap size={16} className="text-amber-500" /> Redis Cache
        </h2>
        <div className="flex gap-2 flex-wrap">
          {[
            { label: 'Flush All',        pattern: '*' },
            { label: 'Flush Routes',     pattern: 'route:*' },
            { label: 'Flush Analytics',  pattern: 'analytics:*' },
          ].map(({ label, pattern }) => (
            <button
              key={pattern}
              onClick={() => flushCache(pattern)}
              disabled={flushing}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Slow queries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            Slow Queries (pg_stat_statements)
          </h2>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Min avg ms:</label>
            <select
              value={minMs}
              onChange={e => setMinMs(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm"
            >
              {[10, 25, 50, 100, 200].map(v => (
                <option key={v} value={v}>{v}ms</option>
              ))}
            </select>
          </div>
        </div>

        {loading && <p className="text-sm text-gray-400 py-4 text-center">Loading…</p>}
        {!loading && slowQueries === null && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <strong>pg_stat_statements not enabled.</strong> Run the sprint12_performance.sql migration first.
          </div>
        )}
        {!loading && slowQueries?.queries?.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">No queries slower than {minMs}ms 🎉</p>
        )}
        {slowQueries?.queries?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="pb-2 font-semibold">Query</th>
                  <th className="pb-2 font-semibold text-right">Calls</th>
                  <th className="pb-2 font-semibold text-right">Avg ms</th>
                  <th className="pb-2 font-semibold text-right">Total ms</th>
                  <th className="pb-2 font-semibold text-right">Avg rows</th>
                </tr>
              </thead>
              <tbody>
                {slowQueries.queries.map((q, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-mono text-gray-600 max-w-xs truncate pr-4">{q.query_preview}</td>
                    <td className="py-2 text-right">{fmt(q.calls)}</td>
                    <td className={`py-2 text-right font-bold ${q.avg_ms > 200 ? 'text-red-600' : q.avg_ms > 100 ? 'text-amber-600' : 'text-gray-700'}`}>
                      {q.avg_ms}
                    </td>
                    <td className="py-2 text-right text-gray-500">{q.total_ms}</td>
                    <td className="py-2 text-right text-gray-500">{q.avg_rows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
