import React, { useState } from 'react';
import { Task, WorkSubmission } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { UserAvatar } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { WorkSubmissionModal } from './WorkSubmissionModal';
import { TaskReviewModal } from './TaskReviewModal';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  MessageSquare,
  History,
  Send,
  Play,
  Check,
  RotateCcw,
  FileCheck,
  AlertTriangle,
  Table,
  Plus,
  Shield,
} from 'lucide-react';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  onEditTask?: (task: Task) => void;
  onSubmitProof?: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onEditTask,
  onSubmitProof,
}) => {
  const { currentUser, isAdmin } = useAuth();
  const { updateTaskStatus, toggleChecklistItem, addTaskComment } = useData();

  const [activeTab, setActiveTab] = useState<'details' | 'submissions' | 'comments' | 'timeline'>('details');
  const [commentInput, setCommentInput] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState<WorkSubmission | null>(null);

  const isAssignedToMe = currentUser ? task.assignedTo.includes(currentUser.id) : false;

  const isOverdue =
    task.status !== 'completed' &&
    task.status !== 'approved' &&
    task.deadline &&
    new Date(task.deadline).getTime() < Date.now();

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addTaskComment(task.id, commentInput.trim());
    setCommentInput('');
  };

  const completedChecklist = task.checklist.filter((c) => c.completed).length;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={task.title}
        subtitle={`Category: ${task.category} • Created by ${task.createdByName || 'Admin'}`}
        maxWidth="4xl"
      >
        <div className="space-y-6">
          {/* Top Metadata Header Bar */}
          <div className="p-4 bg-[#11182c]/80 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={isOverdue && task.status !== 'waiting_for_review' ? 'overdue' : task.status} size="md" />
              <PriorityBadge priority={task.priority} />
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
                {task.category}
              </span>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              {isAdmin && onEditTask && (
                <button
                  onClick={() => onEditTask(task)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  Edit Task
                </button>
              )}

              {/* Status Action for Member */}
              {isAssignedToMe && task.status === 'assigned' && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'accepted', 'Member accepted assigned task')}
                  className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-500/25 transition-all"
                >
                  Accept Task
                </button>
              )}

              {isAssignedToMe && (task.status === 'accepted' || task.status === 'revision_required') && (
                <button
                  onClick={() => updateTaskStatus(task.id, 'in_progress', 'Work started on deliverable')}
                  className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-indigo-500/25 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Start Work
                </button>
              )}

              {isAssignedToMe && (task.status === 'in_progress' || task.status === 'revision_required') && (
                <button
                  onClick={() => {
                    if (onSubmitProof) {
                      onSubmitProof(task);
                    } else {
                      setShowSubmitModal(true);
                    }
                  }}
                  className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Submit Proof of Work
                </button>
              )}

              {/* Admin Review Action */}
              {isAdmin && task.status === 'waiting_for_review' && task.submissions.length > 0 && (
                <button
                  onClick={() => setSelectedSubmissionForReview(task.submissions[task.submissions.length - 1])}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-amber-500/30 transition-all flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Audit Submission ({task.submissions.length})
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 space-x-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Deliverable Details
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>Submissions</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                {task.submissions.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <span>Notes & Comments</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300">
                {task.comments.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                activeTab === 'timeline'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Activity Audit
            </button>
          </div>

          {/* Tab 1: Task Details */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 font-display">
                  Overview & Objective
                </h4>
                <div className="p-4 bg-[#11182c]/60 rounded-xl border border-white/5 text-xs text-slate-200 leading-relaxed font-medium">
                  {task.description}
                </div>
              </div>

              {/* Detailed Instructions if available */}
              {task.detailedInstructions && (
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2 font-display">
                    Standard Operating Protocol & Instructions
                  </h4>
                  <div className="p-4 bg-[#11182c]/60 rounded-xl border border-white/5 text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                    {task.detailedInstructions}
                  </div>
                </div>
              )}

              {/* Checklist */}
              {task.checklist.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 font-display">
                      Required Acceptance Checklist ({completedChecklist}/{task.checklist.length})
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold font-mono">
                      {Math.round((completedChecklist / task.checklist.length) * 100)}% Verified
                    </span>
                  </div>

                  <div className="space-y-2">
                    {task.checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(task.id, item.id)}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                          item.completed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                            : 'bg-[#11182c]/60 border-white/5 text-white hover:border-white/20'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            item.completed
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'border-white/20 bg-black/30'
                          }`}
                        >
                          {item.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reference Links & Live Google Sheet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {task.googleSheetSyncUrl && (
                  <div className="p-4 rounded-xl bg-[#11182c]/60 border border-white/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Table className="w-3.5 h-3.5" />
                      Live Working Spreadsheet
                    </span>
                    <p className="text-xs text-slate-300 truncate">{task.googleSheetSyncUrl}</p>
                    <a
                      href={task.googleSheetSyncUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300"
                    >
                      Open Google Sheet <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#11182c]/60 border border-white/5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Delivery Timeline
                  </span>
                  <p className="text-xs text-slate-300">
                    Due: {task.deadline ? new Date(task.deadline).toLocaleString() : 'No deadline set'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Est. Effort: {task.estimatedHours || 2} Hours
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Submissions */}
          {activeTab === 'submissions' && (
            <div className="space-y-4">
              {task.submissions.length === 0 ? (
                <div className="p-8 text-center bg-[#11182c]/40 rounded-xl border border-white/5">
                  <FileCheck className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No proof submissions uploaded for this task yet.</p>
                </div>
              ) : (
                task.submissions.map((sub, idx) => (
                  <div key={sub.id} className="p-4 bg-[#11182c]/80 rounded-xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Submission #{task.submissions.length - idx}</span>
                        <span className="text-[10px] text-slate-400">by {sub.submittedByName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5">
                      {sub.summaryNotes}
                    </p>

                    {sub.googleSheetUrl && (
                      <a
                        href={sub.googleSheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                      >
                        Proof Sheet Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {sub.reviewFeedback && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-200">
                        <p className="font-bold">Admin Feedback:</p>
                        <p className="mt-0.5">{sub.reviewFeedback}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Comments */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {task.comments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No comments yet. Start a discussion below.
                  </div>
                ) : (
                  task.comments.map((c) => (
                    <div key={c.id} className="p-3 bg-[#11182c]/70 rounded-xl border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white">{c.userName}</span>
                        <span className="text-[10px] text-slate-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-slate-300">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type an internal operational note..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-[#11182c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Post
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              {task.statusHistory.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-white capitalize">{item.status.replace(/_/g, ' ')}</span>
                    <span className="text-[11px] text-slate-400 ml-2">by {item.updatedByName}</span>
                    {item.note && <p className="text-[11px] text-slate-400 mt-0.5">{item.note}</p>}
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Proof Submission Modal */}
      {showSubmitModal && (
        <WorkSubmissionModal
          isOpen={showSubmitModal}
          onClose={() => setShowSubmitModal(false)}
          task={task}
        />
      )}

      {/* Review Modal */}
      {selectedSubmissionForReview && (
        <TaskReviewModal
          isOpen={Boolean(selectedSubmissionForReview)}
          onClose={() => setSelectedSubmissionForReview(null)}
          task={task}
          submission={selectedSubmissionForReview}
        />
      )}
    </>
  );
};
