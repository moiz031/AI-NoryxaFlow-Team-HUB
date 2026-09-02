import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { User, UserRole } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { Modal } from '../common/Modal';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Award,
  Key,
  Mail,
  Briefcase,
  TrendingUp,
  Clock,
  Filter,
  ArrowUpDown,
  Activity,
  Calendar,
  Sparkles,
  Globe,
  Lock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { allUsers, registerUser, updateUserRole, toggleUserStatus } = useAuth();
  const { dailyReports, tasks } = useData();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [authProviderFilter, setAuthProviderFilter] = useState<'all' | 'email' | 'google'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'last_active' | 'name'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Add User modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [jobTitle, setJobTitle] = useState('Campaign Specialist');
  const [department, setDepartment] = useState('Lead Generation');
  const [role, setRole] = useState<UserRole>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Time metrics calculations
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000;
  const monthStart = todayStart - 29 * 24 * 60 * 60 * 1000;

  const totalMembers = allUsers.length;
  const onlineCount = allUsers.filter((u) => u.onlineStatus === 'online').length;
  const offlineCount = totalMembers - onlineCount;

  const newToday = allUsers.filter((u) => {
    const t = new Date(u.createdAt).getTime();
    return !isNaN(t) && t >= todayStart;
  }).length;

  const newThisWeek = allUsers.filter((u) => {
    const t = new Date(u.createdAt).getTime();
    return !isNaN(t) && t >= weekStart;
  }).length;

  const newThisMonth = allUsers.filter((u) => {
    const t = new Date(u.createdAt).getTime();
    return !isNaN(t) && t >= monthStart;
  }).length;

  // Registration chart data (Last 7 Days)
  const registrationChartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const count = allUsers.filter((u) => {
        const t = new Date(u.createdAt).getTime();
        return !isNaN(t) && t >= dayStart && t < dayEnd;
      }).length;

      days.push({ name: dateStr, count });
    }
    return days;
  }, [allUsers]);

  // Recent Join History Log
  const recentActivities = useMemo(() => {
    return [...allUsers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [allUsers]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return allUsers
      .filter((u) => {
        // Search filter
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const matchesName = (u.displayName || u.fullName || '').toLowerCase().includes(term);
          const matchesEmail = u.email.toLowerCase().includes(term);
          const matchesId = u.id.toLowerCase().includes(term);
          const matchesJob = (u.jobTitle || '').toLowerCase().includes(term);
          if (!matchesName && !matchesEmail && !matchesId && !matchesJob) return false;
        }

        // Online/Offline status filter
        if (statusFilter !== 'all') {
          const isOnline = u.onlineStatus === 'online';
          if (statusFilter === 'online' && !isOnline) return false;
          if (statusFilter === 'offline' && isOnline) return false;
        }

        // Auth Provider filter
        if (authProviderFilter !== 'all') {
          const provider = u.authProvider || 'email';
          if (authProviderFilter !== provider) return false;
        }

        // Role filter
        if (roleFilter !== 'all' && u.role !== roleFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'last_active') {
          return new Date(b.lastActiveAt || b.createdAt).getTime() - new Date(a.lastActiveAt || a.createdAt).getTime();
        }
        if (sortBy === 'name') {
          return (a.displayName || a.fullName).localeCompare(b.displayName || b.fullName);
        }
        return 0;
      });
  }, [allUsers, searchTerm, statusFilter, authProviderFilter, roleFilter, sortBy]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await registerUser(email, password, displayName, role, department, jobTitle);
      setEmail('');
      setPassword('');
      setDisplayName('');
      setShowAddModal(false);
    } catch (err: any) {
      setError(err.message || 'Error provisioning account.');
    } finally {
      setLoading(false);
    }
  };

  const formatExactDateTime = (isoString?: string) => {
    if (!isoString) return 'N/A';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }) + ' at ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatLastSeen = (isoString?: string, isOnline?: boolean) => {
    if (isOnline) return 'Online Now';
    if (!isoString) return 'Offline';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Offline';
      const nowMs = Date.now();
      const diffMins = Math.floor((nowMs - d.getTime()) / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Offline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Hero Banner */}
      <div className="relative overflow-hidden bg-[#0d1322]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/50 text-white flex flex-wrap items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-wider font-mono">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              Team Management & Roster System
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Team Members & Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Monitor real-time user status, member registration statistics, role assignments, and authentication logs across the agency.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Provision Team Member
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards Grid (6 Stats Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
            Total Members
          </p>
          <h3 className="text-2xl font-black text-white mt-1 font-display">{totalMembers}</h3>
          <p className="text-[10px] text-indigo-300 font-medium mt-0.5">Active user records</p>
        </div>

        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
            Joined Today
          </p>
          <h3 className="text-2xl font-black text-emerald-400 mt-1 font-display">+{newToday}</h3>
          <p className="text-[10px] text-emerald-300/70 font-medium mt-0.5">New registration</p>
        </div>

        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
            This Week
          </p>
          <h3 className="text-2xl font-black text-cyan-400 mt-1 font-display">+{newThisWeek}</h3>
          <p className="text-[10px] text-cyan-300/70 font-medium mt-0.5">Last 7 days</p>
        </div>

        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
            This Month
          </p>
          <h3 className="text-2xl font-black text-purple-400 mt-1 font-display">+{newThisMonth}</h3>
          <p className="text-[10px] text-purple-300/70 font-medium mt-0.5">Last 30 days</p>
        </div>

        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-400" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Online Now
          </p>
          <h3 className="text-2xl font-black text-emerald-300 mt-1 font-display">{onlineCount}</h3>
          <p className="text-[10px] text-emerald-400/80 font-medium mt-0.5">Live active sessions</p>
        </div>

        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500/50" />
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Offline
          </p>
          <h3 className="text-2xl font-black text-slate-300 mt-1 font-display">{offlineCount}</h3>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Inactive / Logged out</p>
        </div>
      </div>

      {/* Middle Section: Growth Chart & Recent Join Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Growth Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#0d1322]/85 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/10 shadow-xl shadow-black/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Member Registration Trend (Last 7 Days)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                New accounts created daily via Email/Password registration and Google Auth.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Real Database Metrics
            </span>
          </div>

          <div className="h-48 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={registrationChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#ffffff20',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {registrationChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count > 0 ? '#6366f1' : '#334155'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Daily Activity & Join Feed (1 Col) */}
        <div className="bg-[#0d1322]/85 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-xl shadow-black/40 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Recent Join & Auth Feed
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
          </div>

          <div className="space-y-3">
            {recentActivities.map((user) => {
              const isOnline = user.onlineStatus === 'online';
              const isGoogle = user.authProvider === 'google';

              return (
                <div
                  key={user.id}
                  className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar
                      name={user.displayName || user.fullName}
                      avatarUrl={user.avatarUrl}
                      onlineStatus={user.onlineStatus || 'offline'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {user.displayName || user.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                        {isGoogle ? (
                          <span className="text-cyan-400 font-semibold flex items-center gap-0.5">
                            <Globe className="w-3 h-3" /> Google Auth
                          </span>
                        ) : (
                          <span className="text-indigo-400 font-semibold flex items-center gap-0.5">
                            <Mail className="w-3 h-3" /> Email Reg
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {formatLastSeen(user.createdAt, false)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Sorting & Add Member */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl p-4 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Search Input */}
        <div className="relative min-w-[240px] max-w-sm flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search roster by name, email, or user ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3.5 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="online">🟢 Online Only</option>
            <option value="offline">🔴 Offline Only</option>
          </select>

          {/* Auth Provider Filter */}
          <select
            value={authProviderFilter}
            onChange={(e) => {
              setAuthProviderFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="all">Auth: All Providers</option>
            <option value="email">📧 Email / Pass</option>
            <option value="google">🌐 Google Auth</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="all">Role: All</option>
            <option value="admin">Agency Admin</option>
            <option value="member">Team Member</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-[#11182c] border border-white/10 rounded-xl text-xs text-indigo-300 border-indigo-500/30 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="last_active">Sort: Last Active</option>
            <option value="name">Sort: Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Team Roster Table */}
      <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d18] text-[10px] uppercase tracking-wider text-slate-400 border-b border-white/10 font-display">
              <tr>
                <th className="px-5 py-4 font-bold">Member Profile</th>
                <th className="px-4 py-4 font-bold">Auth Provider</th>
                <th className="px-4 py-4 font-bold">Online Presence</th>
                <th className="px-4 py-4 font-bold">Registration Timestamp</th>
                <th className="px-4 py-4 font-bold">Role & Status</th>
                <th className="px-5 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">No Team Members Found</p>
                    <p className="text-xs text-slate-400 mt-1">Try resetting your search filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isOnline = user.onlineStatus === 'online';
                  const isGoogle = user.authProvider === 'google';

                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      {/* Profile & Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={user.displayName || user.fullName}
                            avatarUrl={user.avatarUrl}
                            onlineStatus={user.onlineStatus || 'offline'}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs flex items-center gap-1.5">
                              {user.displayName || user.fullName}
                              {user.role === 'admin' && (
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                                  Admin
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400">{user.email}</p>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Auth Provider */}
                      <td className="px-4 py-4">
                        {isGoogle ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                            <Globe className="w-3 h-3 text-cyan-400" /> Google Auth
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                            <Mail className="w-3 h-3 text-indigo-400" /> Email / Password
                          </span>
                        )}
                      </td>

                      {/* Online Status */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                              isOnline
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                              }`}
                            />
                            {isOnline ? 'Online' : 'Offline'}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Last active: {formatLastSeen(user.lastActiveAt, isOnline)}
                          </p>
                        </div>
                      </td>

                      {/* Join Date & Exact Time */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-200">
                            {formatExactDateTime(user.createdAt)}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Joined System
                          </p>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            user.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {user.status || 'active'}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() =>
                            updateUserRole(user.id, user.role === 'admin' ? 'member' : 'admin')
                          }
                          className="px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          {user.role === 'admin' ? 'Demote to Member' : 'Make Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-[#090d18] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <span>
            Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} members
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-[#11182c] border border-white/10 rounded-lg text-xs font-mono text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Provision New Team Member Account"
          subtitle="Create team access credentials for client deliverables."
          maxWidth="xl"
        >
          <form onSubmit={handleCreateMember} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@noryxa.agency"
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Agency Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
              >
                {loading ? 'Provisioning...' : 'Provision Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
