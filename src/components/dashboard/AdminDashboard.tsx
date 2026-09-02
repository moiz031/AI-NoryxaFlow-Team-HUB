import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Task, WorkSubmission } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { TaskReviewModal } from '../tasks/TaskReviewModal';
import { TaskCreateModal } from '../tasks/TaskCreateModal';
import { CentralPublishModal } from '../admin/CentralPublishModal';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  Users,
  Layers,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  FileCheck,
  Calendar,
  Activity,
  Award,
  ExternalLink,
  Zap,
  ShieldCheck,
  Briefcase,
  Target,
  Megaphone
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (route: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { allUsers, currentUser } = useAuth();
  const { tasks, dailyReports, auditLogs, exportToCSV } = useData();

  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<{
    task: Task;
    submission: WorkSubmission;
  } | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Compute aggregate numbers
  const members = allUsers.filter((u) => u.role === 'member');
  const onlineCount = members.filter((u) => u.onlineStatus === 'online').length;

  const totalLeads = dailyReports.reduce((sum, r) => sum + (r.leadsGenerated || 0), 0);
  const totalContacts = dailyReports.reduce((sum, r) => sum + (r.leadsContacted || 0), 0);
  const totalReplies = dailyReports.reduce((sum, r) => sum + (r.repliesReceived || 0), 0);
  const totalMeetings = dailyReports.reduce((sum, r) => sum + (r.meetingsBooked || 0), 0);

  // Pending Submissions awaiting review
  const pendingReviewTasks = tasks.filter(
    (t) => t.status === 'waiting_for_review' && t.submissions.length > 0
  );

  // Overdue Tasks
  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== 'completed' &&
      t.status !== 'approved' &&
      t.deadline &&
      new Date(t.deadline).getTime() < Date.now()
  );

  // Today's reports
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReports = dailyReports.filter((r) => r.date === todayStr);

  return (
    <div className="space-y-6">
      {/* Top Heavy Dark Hero Banner */}
      <div className="relative overflow-hidden bg-[#0d1322]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/50 text-white flex flex-wrap items-center justify-between gap-6">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Operations Hub
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              NORYXA OS
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Agency Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Monitor verified lead output, client deliverables, live team member activity, and broadcast instant notifications.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            id="admin-broadcast-banner-btn"
            onClick={() => setShowPublishModal(true)}
            className="inline-flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4" />
            Publish & Notify Team
          </button>

          <button
            id="admin-create-task-banner-btn"
            onClick={() => setShowCreateTaskModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Assign New Task
          </button>
        </div>
      </div>

      {/* Urgent Attention Alert: Submissions Awaiting Audit */}
      {pendingReviewTasks.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-[#1a1c2e] to-[#0f1629] border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg shadow-black/30">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-200 font-display">
                {pendingReviewTasks.length} Work Submission(s) Awaiting Review
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Specialists submitted proof-of-work deliverables requiring audit and status approval.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pendingReviewTasks.slice(0, 2).map((t) => (
              <button
                key={t.id}
                onClick={() =>
                  setSelectedSubmissionForReview({
                    task: t,
                    submission: t.submissions[t.submissions.length - 1],
                  })
                }
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
              >
                Audit: {t.title.slice(0, 18)}...
              </button>
            ))}
            <button
              onClick={() => onNavigate('/admin/submissions')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              View All Submissions →
            </button>
          </div>
        </div>
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                Total Leads Generated
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-display">
                {totalLeads.toLocaleString()}
              </h3>
              <p className="text-xs text-indigo-300 mt-1 font-medium">Logged in work reports</p>
            </div>
            <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-indigo-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                Outreach Sent
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-display">
                {totalContacts.toLocaleString()}
              </h3>
              <p className="text-xs text-cyan-300 mt-1 font-medium">{totalReplies} positive replies</p>
            </div>
            <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                Discovery Calls Booked
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-display">
                {totalMeetings}
              </h3>
              <p className="text-xs text-emerald-300 mt-1 font-medium">Qualified sales meetings</p>
            </div>
            <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                Team On Shift
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-display">
                {onlineCount} / {members.length}
              </h3>
              <p className="text-xs text-purple-300 mt-1 font-medium">Active presence right now</p>
            </div>
            <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-purple-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Tasks & Team Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Deliverables & Pipeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Active Deliverables Pipeline
            </h3>
            <button
              onClick={() => onNavigate('/admin/task-board')}
              className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              Open Kanban Board →
            </button>
          </div>

          <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/40">
            {tasks.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#11182c] border border-white/10 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                  <Layers className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                  No Active Deliverables
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Your pipeline is currently clear. Assign tasks to team members to start tracking deliverables and proof submissions.
                </p>
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create First Task
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {tasks.slice(0, 5).map((task) => {
                  const isOverdue =
                    task.status !== 'completed' &&
                    task.status !== 'approved' &&
                    task.deadline &&
                    new Date(task.deadline).getTime() < Date.now();

                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskForDetail(task)}
                      className="p-4 hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                            {task.category}
                          </span>
                          <StatusBadge status={task.status} size="sm" />
                          <PriorityBadge priority={task.priority} />
                          {isOverdue && (
                            <span className="text-[9px] font-black text-rose-300 bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate font-display">
                          {task.title}
                        </h4>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                          Assigned: {task.assignedUserNames?.join(', ') || 'Unassigned'}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
                          Due: {task.deadline ? new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No deadline'}
                        </span>
                        {task.status === 'waiting_for_review' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 underline mt-1 block">
                            Review Proof →
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Team Roster & Quick Audit Logs */}
        <div className="space-y-6">
          {/* Team Active Status */}
          <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Team Roster ({members.length})
              </h3>
              <button
                onClick={() => onNavigate('/admin/team')}
                className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 cursor-pointer"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar
                      name={member.displayName || member.fullName}
                      avatarUrl={member.avatarUrl}
                      onlineStatus={member.onlineStatus || 'offline'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {member.displayName || member.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {member.jobTitle}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      member.onlineStatus === 'online'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {member.onlineStatus || 'offline'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time System Activity Stream */}
          <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Activity Feed
              </h3>
              <button
                onClick={() => onNavigate('/admin/activity-log')}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[9px] font-extrabold uppercase border border-emerald-500/30 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Control Center →
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No activity logged yet.</p>
              ) : (
                auditLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-indigo-300 font-mono truncate">{log.actorName || log.userName || 'System'}</span>
                      <span className="text-[9px] text-slate-400 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs font-semibold text-white">{log.action}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{log.details}</p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => onNavigate('/admin/activity-log')}
              className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-300 transition-colors cursor-pointer"
            >
              Open Full Member Activity Monitor →
            </button>
          </div>

          {/* Quick Operations Actions */}
          <div className="bg-gradient-to-br from-[#11182c] to-[#0d1322] rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/40 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-display flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              Quick Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowPublishModal(true)}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-cyan-500/30 rounded-xl text-left transition-all cursor-pointer"
              >
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-wider block">Broadcast</span>
                <p className="text-xs font-bold text-white mt-0.5">Post & Notify</p>
              </button>

              <button
                onClick={() => onNavigate('/admin/activity-log')}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-indigo-500/30 rounded-xl text-left transition-all cursor-pointer"
              >
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Live Stream</span>
                <p className="text-xs font-bold text-white mt-0.5">Member Activity</p>
              </button>

              <button
                onClick={() => onNavigate('/admin/reports')}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 rounded-xl text-left transition-all cursor-pointer"
              >
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Reports</span>
                <p className="text-xs font-bold text-white mt-0.5">Daily Logs</p>
              </button>

              <button
                onClick={() => onNavigate('/admin/attendance')}
                className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 rounded-xl text-left transition-all cursor-pointer"
              >
                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block">Shifts</span>
                <p className="text-xs font-bold text-white mt-0.5">Live Times</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTaskForDetail && (
        <TaskDetailModal
          isOpen={Boolean(selectedTaskForDetail)}
          onClose={() => setSelectedTaskForDetail(null)}
          task={selectedTaskForDetail}
        />
      )}

      {/* Task Review Modal */}
      {selectedSubmissionForReview && (
        <TaskReviewModal
          isOpen={Boolean(selectedSubmissionForReview)}
          onClose={() => setSelectedSubmissionForReview(null)}
          task={selectedSubmissionForReview.task}
          submission={selectedSubmissionForReview.submission}
        />
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <TaskCreateModal
          isOpen={showCreateTaskModal}
          onClose={() => setShowCreateTaskModal(false)}
        />
      )}

      {/* Central Publish Broadcast Modal */}
      {showPublishModal && (
        <CentralPublishModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
};
