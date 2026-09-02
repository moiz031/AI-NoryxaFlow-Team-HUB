import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  Activity,
  Users,
  CheckCircle2,
  FileText,
  MessageSquare,
  LogIn,
  Clock,
  ShieldAlert,
  GraduationCap,
  Filter,
  Search,
  Zap,
  TrendingUp,
  FileCheck,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';

export const MemberActivityTimeline: React.FC = () => {
  const { allUsers } = useAuth();
  const { auditLogs, dailyReports, communityPosts, tasks, attendanceRecords } = useData();

  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const members = useMemo(() => allUsers.filter((u) => u.role === 'member'), [allUsers]);

  // Combine & enrich all activity logs
  const filteredActivities = useMemo(() => {
    return auditLogs
      .filter((log) => {
        // Filter by member
        if (selectedMemberId !== 'all') {
          const matchedUser = allUsers.find((u) => u.id === selectedMemberId);
          const userName = matchedUser?.displayName || matchedUser?.fullName || '';
          if (log.actorName !== userName && log.userName !== userName && log.actorName !== matchedUser?.email) {
            return false;
          }
        }

        // Filter by category
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'task' && log.targetType !== 'task' && !log.action.includes('Task')) return false;
          if (selectedCategory === 'submission' && log.targetType !== 'submission' && !log.action.includes('Submitted')) return false;
          if (selectedCategory === 'attendance' && log.targetType !== 'attendance' && !log.action.includes('Report') && !log.action.includes('Shift')) return false;
          if (selectedCategory === 'community' && log.targetType !== 'community' && !log.action.includes('Comment') && !log.action.includes('Post')) return false;
          if (selectedCategory === 'learning' && log.targetType !== 'sop' && !log.action.includes('Academy') && !log.action.includes('Learning')) return false;
        }

        // Filter by search term
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchesActor = (log.actorName || '').toLowerCase().includes(term);
          const matchesAction = (log.action || '').toLowerCase().includes(term);
          const matchesTarget = (log.target || '').toLowerCase().includes(term);
          const matchesDetails = (log.details || '').toLowerCase().includes(term);
          if (!matchesActor && !matchesAction && !matchesTarget && !matchesDetails) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, selectedMemberId, selectedCategory, searchTerm, allUsers]);

  const getActivityIcon = (action: string, type?: string) => {
    if (action.includes('Task') || type === 'task') return <Layers className="w-4 h-4 text-indigo-400" />;
    if (action.includes('Submitted') || action.includes('Work') || type === 'submission') return <FileCheck className="w-4 h-4 text-amber-400" />;
    if (action.includes('Report') || action.includes('Shift') || type === 'attendance') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (action.includes('Comment') || action.includes('Post') || type === 'community') return <MessageSquare className="w-4 h-4 text-cyan-400" />;
    if (action.includes('Academy') || action.includes('Learning') || type === 'sop') return <GraduationCap className="w-4 h-4 text-purple-400" />;
    return <Activity className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-[#0d1322]/90 backdrop-blur-2xl p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 text-white flex flex-wrap items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Agency Activity Monitor
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Team Member Activity Control Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time audit stream of all team member actions across the platform — including logins, shift times, task submissions, EOD reports, and learning progress.
          </p>
        </div>

        {/* Member Online Counter */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {allUsers.filter((u) => u.onlineStatus === 'online').length} Members Online Now
          </div>
        </div>
      </div>

      {/* Member Quick Activity Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const memberReports = dailyReports.filter((r) => r.userId === member.id || r.userEmail === member.email);
          const memberTasks = tasks.filter((t) => t.assignedTo?.includes(member.id));
          const isOnline = member.onlineStatus === 'online';

          return (
            <div
              key={member.id}
              onClick={() => setSelectedMemberId(selectedMemberId === member.id ? 'all' : member.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedMemberId === member.id
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/20'
                  : 'bg-[#0d1322]/85 backdrop-blur-xl border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar
                    name={member.displayName || member.fullName}
                    avatarUrl={member.avatarUrl}
                    onlineStatus={member.onlineStatus || 'offline'}
                    size="md"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {member.displayName || member.fullName}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">{member.jobTitle}</p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isOnline
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5 text-center">
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Tasks</span>
                  <span className="text-xs font-extrabold text-white">{memberTasks.length}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Reports</span>
                  <span className="text-xs font-extrabold text-indigo-300">{memberReports.length}</span>
                </div>
                <div className="bg-white/5 p-1.5 rounded-lg">
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Filter</span>
                  <span className="text-[10px] font-bold text-cyan-400">
                    {selectedMemberId === member.id ? 'Active ✓' : 'View'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls Bar: Search & Category Filters */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="relative min-w-[240px] max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search activity by keyword, member name, action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Member Filter Dropdown */}
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="all">Member: All Team Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                👤 {m.displayName || m.fullName}
              </option>
            ))}
          </select>

          {/* Category Filter Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-indigo-300 border-indigo-500/30 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="all">Category: All Activity Types</option>
            <option value="task">📋 Deliverables & Tasks</option>
            <option value="submission">📥 Proof Submissions</option>
            <option value="attendance">⏱️ Shift & Reports</option>
            <option value="community">💬 Community & Comments</option>
            <option value="learning">🎓 Academy Progress</option>
          </select>

          {(selectedMemberId !== 'all' || selectedCategory !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedMemberId('all');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Real-Time Timeline List */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl shadow-black/40 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-display">
            <Clock className="w-4 h-4 text-indigo-400" />
            Live Audit Stream ({filteredActivities.length} Records)
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Auto-updating Firestore Log</span>
        </div>

        <div className="relative pl-6 space-y-4 border-l-2 border-white/10">
          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Activity className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No Activity Records Match Your Filter</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your member or category filters.</p>
            </div>
          ) : (
            filteredActivities.slice(0, 30).map((act) => (
              <div key={act.id} className="relative group">
                {/* Node Bullet */}
                <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[#0d1322] shadow-sm shadow-indigo-500 group-hover:scale-125 transition-transform" />

                <div className="p-4 rounded-xl bg-[#11182c]/90 border border-white/5 hover:border-indigo-500/30 transition-all text-xs space-y-1.5 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(act.action, act.targetType)}
                      <span className="font-extrabold text-white text-xs">{act.actorName}</span>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                        {act.action}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(act.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs">
                    Target: <strong className="text-white font-semibold">{act.target}</strong>
                    {act.details && <span className="text-slate-400 font-normal"> — {act.details}</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
