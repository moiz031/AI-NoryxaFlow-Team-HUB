import React from 'react';
import { Task } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Paperclip,
  ArrowRight,
  AlertTriangle,
  Send
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  onQuickStatusChange?: (taskId: string, newStatus: Task['status']) => void;
  onSubmitWork?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpenDetail,
  onSubmitWork,
}) => {
  const { currentUser, isAdmin } = useAuth();

  const completedChecklistCount = task.checklist.filter((c) => c.completed).length;
  const totalChecklistCount = task.checklist.length;
  const checklistPercent = totalChecklistCount > 0 ? Math.round((completedChecklistCount / totalChecklistCount) * 100) : 0;

  // Check if overdue
  const isOverdue =
    task.status !== 'completed' &&
    task.status !== 'approved' &&
    task.deadline &&
    new Date(task.deadline).getTime() < Date.now();

  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      id={`task-card-${task.id}`}
      onClick={() => onOpenDetail(task)}
      className={`rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden bg-[#0d1322]/90 backdrop-blur-xl shadow-xl shadow-black/30 ${
        isOverdue
          ? 'border-rose-500/40 hover:border-rose-500/80'
          : 'border-white/10 hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
              {task.category}
            </span>
          </div>

          <StatusBadge status={isOverdue && task.status !== 'waiting_for_review' ? 'overdue' : task.status} />
        </div>

        {/* Title & Description */}
        <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug mb-1 font-display group-hover:text-indigo-200 transition-colors">
          {task.title}
        </h4>
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed font-medium">
          {task.description}
        </p>

        {/* Checklist Progress Bar */}
        {totalChecklistCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
              <span className="flex items-center gap-1">
                Checklist ({completedChecklistCount}/{totalChecklistCount})
              </span>
              <span>{checklistPercent}%</span>
            </div>
            <div className="w-full bg-[#11182c] h-1.5 rounded-full overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  checklistPercent === 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                }`}
                style={{ width: `${checklistPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-3.5 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
        {/* Deadline */}
        <div className="flex items-center gap-1.5">
          {isOverdue ? (
            <span className="flex items-center gap-1 text-rose-300 font-extrabold uppercase tracking-wider text-[10px] bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
              <AlertTriangle className="w-3 h-3" />
              Overdue
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
              <Clock className="w-3 h-3 text-indigo-400" />
              {formattedDeadline || 'No deadline'}
            </span>
          )}
        </div>

        {/* Assignees & Meta Counts */}
        <div className="flex items-center gap-3">
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-slate-400">
              <Paperclip className="w-3 h-3" />
              {task.attachments.length}
            </span>
          )}
          {task.comments.length > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-slate-400">
              <MessageSquare className="w-3 h-3" />
              {task.comments.length}
            </span>
          )}

          {/* Assignee Avatar Stack */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {task.assignedUserNames?.map((name, i) => (
              <UserAvatar key={i} name={name} size="xs" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
