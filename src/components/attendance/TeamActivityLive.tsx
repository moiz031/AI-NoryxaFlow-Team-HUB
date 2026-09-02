import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  Clock,
  Download,
  Users,
  CheckCircle2,
  Calendar,
  Search,
  Activity,
  Filter,
  Flame,
} from 'lucide-react';

export const TeamActivityLive: React.FC = () => {
  const { allUsers } = useAuth();
  const { attendanceRecords, dailyReports, tasks, auditLogs, exportToCSV } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [activityCategory, setActivityCategory] = useState<'all' | 'user' | 'submission' | 'file' | 'task' | 'community'>('all');

  const members = allUsers.filter((u) => u.role === 'member');
  const onlineCount = members.filter((u) => u.onlineStatus === 'online').length;
  const awayCount = members.filter((u) => u.onlineStatus === 'away').length;
  const offlineCount = members.filter((u) => u.onlineStatus === 'offline').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const reportsSubmittedToday = dailyReports.filter((r) => r.date === todayStr).length;

  const filteredMembers = members.filter((m) => {
    if (!searchTerm) return true;
    return (
      (m.displayName || m.fullName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (activityCategory === 'all') return true;
    return log.targetType === activityCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Stat Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
              Active Online Now
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-display">{onlineCount}</p>
          <p className="text-xs text-emerald-300 mt-1 font-medium">Out of {members.length} specialists</p>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
              Today's Reports
            </span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-display">{reportsSubmittedToday}</p>
          <p className="text-xs text-indigo-300 mt-1 font-medium">Reports verified</p>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-orange-400" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
              Away / Break
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-display">{awayCount}</p>
          <p className="text-xs text-amber-300 mt-1 font-medium">Paused shifts</p>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-slate-500 to-slate-700" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
              Offline Staff
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-extrabold text-white mt-2 font-display">{offlineCount}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">Off duty</p>
        </div>
      </div>

      {/* Main Roster Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/40">
          <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-[#11182c]/80">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, role or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 bg-[#090d18] border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={() => exportToCSV('attendance')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Log (CSV)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#090d18] text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/10 font-display">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Specialist</th>
                  <th className="px-6 py-3.5 font-bold">Department</th>
                  <th className="px-6 py-3.5 font-bold">Live Status</th>
                  <th className="px-6 py-3.5 font-bold">Today's Report</th>
                  <th className="px-6 py-3.5 font-bold">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredMembers.map((member) => {
                  const hasSubmitted = dailyReports.some((r) => r.userId === member.id && r.date === todayStr);

                  return (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={member.displayName || member.fullName}
                            avatarUrl={member.avatarUrl}
                            onlineStatus={member.onlineStatus || 'offline'}
                            size="sm"
                          />
                          <div>
                            <p className="font-bold text-white text-xs">{member.displayName || member.fullName}</p>
                            <p className="text-[10px] text-slate-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">
                        {member.jobTitle} • {member.department}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            member.onlineStatus === 'online'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : member.onlineStatus === 'away'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}
                        >
                          {member.onlineStatus || 'offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {hasSubmitted ? (
                          <span className="text-emerald-300 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Logged
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium text-[11px]">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleTimeString() : 'Recently'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Real-Time Audit Log Feed */}
        <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/40 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live Activity Feed ({filteredAuditLogs.length})
            </h3>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[9px] font-extrabold uppercase border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Sync
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['all', 'user', 'submission', 'file', 'task', 'community'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActivityCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activityCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredAuditLogs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-slate-500">No activity logged under this filter.</p>
              </div>
            ) : (
              filteredAuditLogs.slice(0, 15).map((log) => (
                <div key={log.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1.5 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-indigo-300 font-mono truncate">
                      {log.actorName || log.userName || 'System'}
                    </span>
                    <span className="text-[9px] text-slate-400 flex-shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase font-mono">
                      {log.targetType || 'action'}
                    </span>
                    <p className="text-xs font-semibold text-white truncate">{log.action}</p>
                  </div>
                  {log.details && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">{log.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
