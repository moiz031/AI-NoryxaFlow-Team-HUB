import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ShieldCheck, Search, Filter, Clock, Download } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs, exportToCSV } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (severityFilter !== 'all' && log.severity !== severityFilter) return false;
    if (!searchTerm) return true;
    return (
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl shadow-black/30">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-display">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Compliance & Activity Audit Trail
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system logs of auth events, deliverable audits, status modifications, and security actions.
          </p>
        </div>

        <button
          onClick={() => exportToCSV('audit')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          Export Audit Trail (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-black/30">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search action, specialist, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d18] text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/10 font-display">
              <tr>
                <th className="px-6 py-4 font-bold">Timestamp</th>
                <th className="px-6 py-4 font-bold">Severity</th>
                <th className="px-6 py-4 font-bold">Actor</th>
                <th className="px-6 py-4 font-bold">Action</th>
                <th className="px-6 py-4 font-bold">Context Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          log.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : log.severity === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-white text-xs">{log.userName}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-200">{log.action}</td>
                    <td className="px-6 py-3.5 text-slate-400 font-mono text-[11px]">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
