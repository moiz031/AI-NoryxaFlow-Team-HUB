import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Task } from '../../types';
import { TaskCard } from '../tasks/TaskCard';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { WorkSubmissionModal } from '../tasks/WorkSubmissionModal';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  FileCheck,
  Megaphone,
  BookOpen,
  ArrowRight,
  Play,
  AlertCircle,
  Table,
  Zap,
  Target,
  Send,
  Plus
} from 'lucide-react';

interface MemberDashboardProps {
  onNavigate: (route: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({ onNavigate }) => {
  const { currentUser, attendanceSession } = useAuth();
  const { tasks, dailyReports, communityPosts, settings } = useData();

  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [taskForSubmission, setTaskForSubmission] = useState<Task | null>(null);

  if (!currentUser) return null;

  // Filter tasks assigned to current member
  const myTasks = tasks.filter((t) => t.assignedTo.includes(currentUser.id));
  const activeTasks = myTasks.filter((t) => t.status !== 'completed' && t.status !== 'approved');
  const completedTasks = myTasks.filter((t) => t.status === 'completed' || t.status === 'approved');

  // Today's report
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReport = dailyReports.find(
    (r) => r.userId === currentUser.id && r.date === todayStr
  );

  // Community announcements
  const announcements = communityPosts.filter((p) => p.isPinned || p.category === 'Announcements').slice(0, 2);

  // My stats
  const myLeads = dailyReports
    .filter((r) => r.userId === currentUser.id)
    .reduce((sum, r) => sum + (r.leadsGenerated || 0), 0);
  const myOutreach = dailyReports
    .filter((r) => r.userId === currentUser.id)
    .reduce((sum, r) => sum + (r.leadsContacted || 0), 0);
  const myMeetings = dailyReports
    .filter((r) => r.userId === currentUser.id)
    .reduce((sum, r) => sum + (r.meetingsBooked || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden bg-[#0d1322]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl shadow-black/50 text-white flex flex-wrap items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {attendanceSession.isActive ? 'Shift Timer Running' : 'Shift Paused'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
              Member Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Welcome back, {currentUser.displayName?.split(' ')[0] || currentUser.fullName?.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            {currentUser.jobTitle} • {currentUser.department} Department
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            id="member-submit-eod-btn"
            onClick={() => onNavigate('daily-report')}
            className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              todayReport
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/30 hover:scale-[1.02]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            {todayReport ? '✓ Today\'s Report Logged' : 'Submit Daily Work Report'}
          </button>
        </div>
      </div>

      {/* Top 4 Performance & Output Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                Active Tasks
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-display">
                {activeTasks.length}
              </h3>
              <p className="text-xs text-indigo-300 mt-1 font-medium">{completedTasks.length} Completed</p>
            </div>
            <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                My Leads
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-display">
                {myLeads.toLocaleString()}
              </h3>
              <p className="text-xs text-cyan-300 mt-1 font-medium">Verified sourced</p>
            </div>
            <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-cyan-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                Outreach Sent
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-display">
                {myOutreach.toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-300 mt-1 font-medium">Messages delivered</p>
            </div>
            <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display">
                Calls Booked
              </p>
              <h3 className="text-3xl font-extrabold text-white mt-2 font-display">
                {myMeetings}
              </h3>
              <p className="text-xs text-purple-300 mt-1 font-medium">Qualified meetings</p>
            </div>
            <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: My Active Tasks & Knowledge Quicklinks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              My Assigned Deliverables ({activeTasks.length})
            </h3>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View All Tasks →
            </button>
          </div>

          <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-black/40">
            {activeTasks.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#11182c] border border-white/10 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white font-display">
                  No Pending Tasks Assigned
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You are all caught up! When admin assigns new deliverables, they will appear here with instructions and proof submission buttons.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {activeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between gap-4"
                  >
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => setSelectedTaskForDetail(task)}
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                          {task.category}
                        </span>
                        <StatusBadge status={task.status} size="sm" />
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate font-display">
                        {task.title}
                      </h4>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                        Due: {task.deadline ? new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'No deadline'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setTaskForSubmission(task)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                      >
                        Submit Proof
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Academy */}
        <div className="space-y-6">
          <div className="bg-[#0d1322]/85 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-xl shadow-black/40 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-white font-display flex items-center gap-2 border-b border-white/10 pb-3">
              <Zap className="w-4 h-4 text-indigo-400" />
              Specialist Quick Links
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('daily-report')}
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white">Daily EOD Report</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('sops')}
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white">Company Standard SOPs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('learning')}
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">Outreach Academy</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('community')}
                className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-left transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Megaphone className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white">Agency Community Feed</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
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
          onSubmitProof={(task) => {
            setSelectedTaskForDetail(null);
            setTaskForSubmission(task);
          }}
        />
      )}

      {/* Submit Work Modal */}
      {taskForSubmission && (
        <WorkSubmissionModal
          isOpen={Boolean(taskForSubmission)}
          onClose={() => setTaskForSubmission(null)}
          task={taskForSubmission}
        />
      )}
    </div>
  );
};
